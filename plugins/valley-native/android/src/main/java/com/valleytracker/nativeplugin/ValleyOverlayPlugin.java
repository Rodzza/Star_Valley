package com.valleytracker.nativeplugin;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;

/**
 * Ponte entre o app (JavaScript) e o botão flutuante.
 * O app calcula o texto; aqui só guardamos e mandamos o serviço desenhar.
 */
@CapacitorPlugin(name = "ValleyOverlay")
public class ValleyOverlayPlugin extends Plugin {

    static final String PREFS = "valley_overlay";
    static final String KEY_TITLE = "title";
    static final String KEY_LINES = "lines";
    static final String KEY_X = "x";
    static final String KEY_Y = "y";
    /** Lista de dias já calculados pelo app: [{title, lines:[...]}, ...]. O índice 0 é o dia marcado no app. */
    static final String KEY_DAYS = "days";
    /** Quantos dias o jogador avançou pelo botão "Dormi" desde o último envio do app. */
    static final String KEY_INDEX = "dayIndex";
    /** Quando o jogador confirmou o dia pela última vez (ms), para perguntar "Ainda é ...?" depois de uma pausa. */
    static final String KEY_CONFIRMED_AT = "confirmedAt";

    @PluginMethod
    public void status(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", canDraw());
        ret.put("running", OverlayService.isRunning());
        call.resolve(ret);
    }

    /** Abre a tela do Android onde o usuário liga "Exibir sobre outros apps" para este app. */
    @PluginMethod
    public void requestPermission(PluginCall call) {
        Context ctx = getContext();
        Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + ctx.getPackageName()));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        ctx.startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void show(PluginCall call) {
        if (!canDraw()) {
            call.reject("PERMISSION_DENIED");
            return;
        }
        String title = call.getString("title", "");
        JSArray lines = call.getArray("lines", new JSArray());
        JSONArray safe = new JSONArray();
        for (int i = 0; i < lines.length(); i++) {
            safe.put(lines.optString(i, ""));
        }
        SharedPreferences.Editor ed = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit();
        ed.putString(KEY_TITLE, title);
        ed.putString(KEY_LINES, safe.toString());
        ed.apply();

        Intent intent = new Intent(getContext(), OverlayService.class);
        intent.setAction(OverlayService.ACTION_SHOW);
        if (Build.VERSION.SDK_INT >= 26) {
            getContext().startForegroundService(intent);
        } else {
            getContext().startService(intent);
        }
        call.resolve();
    }

    /**
     * Recebe os próximos dias já calculados. O botão flutuante avança entre eles com "Dormi",
     * sem precisar do app aberto. Zera o avanço: o índice 0 passa a ser o dia enviado agora.
     */
    @PluginMethod
    public void showDays(PluginCall call) {
        if (!canDraw()) {
            call.reject("PERMISSION_DENIED");
            return;
        }
        JSArray days = call.getArray("days", new JSArray());
        JSONArray safe = new JSONArray();
        for (int i = 0; i < days.length(); i++) {
            org.json.JSONObject d = days.optJSONObject(i);
            if (d == null) continue;
            org.json.JSONObject clean = new org.json.JSONObject();
            try {
                clean.put("title", d.optString("title", ""));
                JSONArray lines = d.optJSONArray("lines");
                JSONArray cleanLines = new JSONArray();
                if (lines != null) {
                    for (int j = 0; j < lines.length(); j++) cleanLines.put(lines.optString(j, ""));
                }
                clean.put("lines", cleanLines);
            } catch (org.json.JSONException ignored) {
                continue;
            }
            safe.put(clean);
        }
        if (safe.length() == 0) {
            call.reject("NO_DAYS");
            return;
        }
        getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
                .putString(KEY_DAYS, safe.toString())
                .putInt(KEY_INDEX, 0)
                .putLong(KEY_CONFIRMED_AT, System.currentTimeMillis())
                .apply();

        Intent intent = new Intent(getContext(), OverlayService.class);
        intent.setAction(OverlayService.ACTION_SHOW);
        if (Build.VERSION.SDK_INT >= 26) {
            getContext().startForegroundService(intent);
        } else {
            getContext().startService(intent);
        }
        call.resolve();
    }

    /** Quantos dias o jogador avançou no botão desde o último envio (para o app atualizar a data). */
    @PluginMethod
    public void progress(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("index", getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE).getInt(KEY_INDEX, 0));
        call.resolve(ret);
    }

    @PluginMethod
    public void hide(PluginCall call) {
        Intent intent = new Intent(getContext(), OverlayService.class);
        intent.setAction(OverlayService.ACTION_STOP);
        getContext().startService(intent);
        call.resolve();
    }

    private boolean canDraw() {
        return Build.VERSION.SDK_INT < 23 || Settings.canDrawOverlays(getContext());
    }
}
