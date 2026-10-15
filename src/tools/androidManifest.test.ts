import { describe, expect, it } from 'vitest';
import { patchAdMobAppId } from './androidManifest';

const ID = 'ca-app-pub-1234567890123456~1234567890';
const base = `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:label="x" android:theme="@style/AppTheme">
        <activity android:name=".MainActivity" />
    </application>
</manifest>`;

describe('AndroidManifest do AdMob', () => {
  it('insere o meta-data dentro de <application>', () => {
    const out = patchAdMobAppId(base, ID);
    expect(out).toContain(`android:value="${ID}"`);
    expect(out.indexOf('<meta-data')).toBeGreaterThan(out.indexOf('<application'));
    expect(out.indexOf('<meta-data')).toBeLessThan(out.indexOf('<activity'));
  });
  it('é idempotente e troca um ID antigo', () => {
    const once = patchAdMobAppId(base, ID);
    const other = 'ca-app-pub-9999999999999999~0000000001';
    const twice = patchAdMobAppId(patchAdMobAppId(once, ID), other);
    expect(twice.match(/APPLICATION_ID/g)).toHaveLength(1);
    expect(twice).toContain(other);
    expect(twice).not.toContain(ID);
  });
  it('recusa ID inválido (ex.: ID de unidade com "/")', () => {
    expect(() => patchAdMobAppId(base, 'ca-app-pub-1234567890123456/1234567890')).toThrow();
  });
});
