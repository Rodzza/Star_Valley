#!/usr/bin/env bash
# Análise de segurança com SonarQube Community (https://github.com/SonarSource/sonarqube).
# Sobe um servidor SonarQube temporário em Docker, analisa o código, mostra os problemas
# e falha se houver vulnerabilidade ou bug bloqueador. Sem conta e sem servidor fixo.
# Uso: ci/sonarqube.sh <chave-do-projeto>
set -euo pipefail

KEY="${1:?chave do projeto}"
URL="http://localhost:9000"
PASS="Ci-$(openssl rand -hex 12)"
REPORT="${GITHUB_STEP_SUMMARY:-/dev/stdout}"

echo "::group::Subindo o SonarQube"
sudo sysctl -w vm.max_map_count=524288 >/dev/null
sudo sysctl -w fs.file-max=131072 >/dev/null
docker run -d --name sonarqube -p 9000:9000 -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true sonarqube:community >/dev/null
for i in $(seq 1 90); do
  status=$(curl -s "$URL/api/system/status" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("status",""))' 2>/dev/null || true)
  [ "$status" = "UP" ] && break
  sleep 5
done
[ "$status" = "UP" ] || { docker logs sonarqube | tail -50; echo "SonarQube não subiu"; exit 1; }
curl -sf -u admin:admin -X POST "$URL/api/users/change_password" \
  --data-urlencode login=admin --data-urlencode previousPassword=admin --data-urlencode "password=$PASS"
TOKEN=$(curl -sf -u "admin:$PASS" -X POST "$URL/api/user_tokens/generate" --data-urlencode name=ci \
  | python3 -c 'import json,sys;print(json.load(sys.stdin)["token"])')
echo "::add-mask::$TOKEN"
echo "::endgroup::"

echo "::group::Analisando o código"
docker run --rm --network host -v "$PWD:/usr/src" -e SONAR_HOST_URL="$URL" -e SONAR_TOKEN="$TOKEN" \
  sonarsource/sonar-scanner-cli -Dsonar.projectKey="$KEY" -Dsonar.qualitygate.wait=false
for i in $(seq 1 60); do
  pending=$(curl -s -u "$TOKEN:" "$URL/api/ce/component?component=$KEY" \
    | python3 -c 'import json,sys;d=json.load(sys.stdin);print(len(d.get("queue",[])) + (0 if d.get("current") else 1))')
  [ "$pending" = "0" ] && break
  sleep 3
done
echo "::endgroup::"

# Relatório: vulnerabilidades, bugs e pontos de segurança para revisar (hotspots).
curl -s -u "$TOKEN:" "$URL/api/issues/search?componentKeys=$KEY&resolved=false&ps=500&types=VULNERABILITY,BUG" > /tmp/issues.json
curl -s -u "$TOKEN:" "$URL/api/hotspots/search?projectKey=$KEY&ps=500&status=TO_REVIEW" > /tmp/hotspots.json
python3 - "$REPORT" <<'PY'
import json, sys
issues = json.load(open('/tmp/issues.json')).get('issues', [])
hots = json.load(open('/tmp/hotspots.json')).get('hotspots', [])
BLOCK = {'BLOCKER', 'CRITICAL', 'MAJOR'}
vulns = [i for i in issues if i['type'] == 'VULNERABILITY']
bugs = [i for i in issues if i['type'] == 'BUG' and i['severity'] in {'BLOCKER', 'CRITICAL'}]
def where(i):
    return f"{i['component'].split(':', 1)[-1]}:{i.get('line', '?')}"
out = ["## SonarQube: análise de segurança", "",
       f"| Tipo | Quantidade |", "| --- | --- |",
       f"| Vulnerabilidades | {len(vulns)} |", f"| Bugs bloqueadores/críticos | {len(bugs)} |",
       f"| Pontos de segurança para revisar (não bloqueiam) | {len(hots)} |", ""]
for title, rows in (("Vulnerabilidades", vulns), ("Bugs bloqueadores/críticos", bugs)):
    if rows:
        out += [f"### {title}", ""] + [f"- **{i['severity']}** `{where(i)}`: {i['message']}" for i in rows] + [""]
if hots:
    out += ["### Pontos de segurança para revisar", ""] + [
        f"- `{h['component'].split(':', 1)[-1]}:{h.get('line', '?')}` ({h.get('vulnerabilityProbability')}): {h['message']}" for h in hots[:50]] + [""]
open(sys.argv[1], 'a').write("\n".join(out) + "\n")
print("\n".join(out))
failed = [i for i in vulns if i['severity'] in BLOCK] + bugs
sys.exit(1 if failed else 0)
PY
