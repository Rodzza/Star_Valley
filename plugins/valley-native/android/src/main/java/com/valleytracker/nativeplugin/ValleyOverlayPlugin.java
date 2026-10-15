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
