package com.valleytracker.nativeplugin;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Rect;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.IBinder;
import android.provider.Settings;
import android.util.DisplayMetrics;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewConfiguration;
import android.view.WindowManager;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import org.json.JSONArray;

/**
 * Botão flutuante translúcido e arrastável. Toque no botão abre/fecha o painel com as dicas.
 * Só desenha texto que o app já calculou; não lê o jogo nem a tela.
 */
public class OverlayService extends Service {

    static final String ACTION_SHOW = "com.valleytracker.nativeplugin.SHOW";
    static final String ACTION_STOP = "com.valleytracker.nativeplugin.STOP";

    private static final String CHANNEL_ID = "valley_overlay";
    private static final int NOTIFICATION_ID = 4711;

    private static volatile boolean running = false;

    static boolean isRunning() {
        return running;
    }

    private WindowManager windowManager;
    private LinearLayout root;
    private TextView bubble;
    private ScrollView panelScroll;
    private LinearLayout panel;
    private WindowManager.LayoutParams params;
    private boolean expanded = false;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent == null ? null : intent.getAction();

        if (ACTION_STOP.equals(action)) {
            teardown();
            stopForegroundCompat();
            stopSelf();
            return START_NOT_STICKY;
        }

        // Para qualquer outra ação (inclusive reinício pelo sistema) precisamos virar serviço em primeiro plano.
        startForegroundCompat();

        if (Build.VERSION.SDK_INT >= 23 && !Settings.canDrawOverlays(this)) {
            teardown();
            stopForegroundCompat();
            stopSelf();
            return START_NOT_STICKY;
        }

        ensureOverlay();
        fillPanel();
        running = true;
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        teardown();
        super.onDestroy();
    }

    // ---------- notificação obrigatória do serviço em primeiro plano ----------

    private void startForegroundCompat() {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel(CHANNEL_ID, "Botão flutuante", NotificationManager.IMPORTANCE_LOW);
            nm.createNotificationChannel(ch);
            b = new Notification.Builder(this, CHANNEL_ID);
        } else {
            b = new Notification.Builder(this);
        }
        b.setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle("Valley Tracker")
                .setContentText("Botão flutuante ativo. Toque para abrir o app.")
                .setOngoing(true);

        Intent launch = getPackageManager().getLaunchIntentForPackage(getPackageName());
        if (launch != null) {
            int piFlags = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
            b.setContentIntent(PendingIntent.getActivity(this, 0, launch, piFlags));
        }

        Notification n = b.build();
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(NOTIFICATION_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        } else {
            startForeground(NOTIFICATION_ID, n);
        }
    }

    private void stopForegroundCompat() {
        if (Build.VERSION.SDK_INT >= 24) {
            stopForeground(Service.STOP_FOREGROUND_REMOVE);
        } else {
            stopForeground(true);
        }
    }

    // ---------- overlay ----------

    private int dp(float v) {
        return Math.round(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics()));
    }

    private Rect screen() {
        if (Build.VERSION.SDK_INT >= 30) {
            return windowManager.getCurrentWindowMetrics().getBounds();
        }
        DisplayMetrics dm = new DisplayMetrics();
        windowManager.getDefaultDisplay().getRealMetrics(dm);
        return new Rect(0, 0, dm.widthPixels, dm.heightPixels);
    }

    private void ensureOverlay() {
        if (root != null) return;
        windowManager = (WindowManager) getSystemService(Context.WINDOW_SERVICE);

        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setAlpha(0.75f);

        bubble = new TextView(this);
        bubble.setText("V");
        bubble.setTextColor(Color.WHITE);
        bubble.setTextSize(TypedValue.COMPLEX_UNIT_SP, 20);
        bubble.setTypeface(bubble.getTypeface(), android.graphics.Typeface.BOLD);
        bubble.setGravity(Gravity.CENTER);
        GradientDrawable circle = new GradientDrawable();
        circle.setShape(GradientDrawable.OVAL);
        circle.setColor(0xFF1F7A4D);
        circle.setStroke(dp(2), Color.WHITE);
        bubble.setBackground(circle);
        bubble.setContentDescription("Valley Tracker: abrir ou fechar dicas de missões");
        root.addView(bubble, new LinearLayout.LayoutParams(dp(48), dp(48)));

        panel = new LinearLayout(this);
        panel.setOrientation(LinearLayout.VERTICAL);
        panel.setPadding(dp(12), dp(10), dp(12), dp(10));
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(0xF2101A24);
        bg.setCornerRadius(dp(12));
        panel.setBackground(bg);

        panelScroll = new ScrollView(this);
        panelScroll.addView(panel);
        panelScroll.setVisibility(View.GONE);
        LinearLayout.LayoutParams pl = new LinearLayout.LayoutParams(dp(270), LinearLayout.LayoutParams.WRAP_CONTENT);
        pl.topMargin = dp(6);
        root.addView(panelScroll, pl);

        int type = Build.VERSION.SDK_INT >= 26
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;
        params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                type,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT);
        params.gravity = Gravity.TOP | Gravity.START;

        SharedPreferences prefs = getSharedPreferences(ValleyOverlayPlugin.PREFS, Context.MODE_PRIVATE);
        Rect s = screen();
        params.x = clamp(prefs.getInt(ValleyOverlayPlugin.KEY_X, s.width() - dp(48)), 0, Math.max(0, s.width() - dp(48)));
        params.y = clamp(prefs.getInt(ValleyOverlayPlugin.KEY_Y, s.height() / 3), 0, Math.max(0, s.height() - dp(48)));

        bubble.setOnTouchListener(new DragListener());
        windowManager.addView(root, params);
    }

    private void fillPanel() {
        if (panel == null) return;
        SharedPreferences prefs = getSharedPreferences(ValleyOverlayPlugin.PREFS, Context.MODE_PRIVATE);
        String title = prefs.getString(ValleyOverlayPlugin.KEY_TITLE, "");
        String linesJson = prefs.getString(ValleyOverlayPlugin.KEY_LINES, "[]");

        panel.removeAllViews();
        panel.addView(text(title, 15, Color.WHITE, true));
        try {
            JSONArray lines = new JSONArray(linesJson);
            for (int i = 0; i < lines.length(); i++) {
                TextView t = text(lines.optString(i, ""), 13, 0xFFE6EDF3, false);
                t.setPadding(0, dp(6), 0, 0);
                panel.addView(t);
            }
        } catch (Exception ignored) {
            // JSON inválido: mostra só o título.
        }

        TextView hide = text("Esconder botão", 13, 0xFF7FD6A5, true);
        hide.setPadding(0, dp(12), 0, 0);
        hide.setOnClickListener(v -> {
            teardown();
            stopForegroundCompat();
            stopSelf();
        });
        panel.addView(hide);
    }

    private TextView text(String s, float sp, int color, boolean bold) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        t.setTextColor(color);
        if (bold) t.setTypeface(t.getTypeface(), android.graphics.Typeface.BOLD);
        return t;
    }

    private void setExpanded(boolean value) {
        expanded = value;
        Rect s = screen();
        if (value) {
            // Limita a altura do painel para caber na tela (o jogo roda na horizontal, onde sobra pouco).
            int maxH = (int) (s.height() * 0.6f);
            panel.measure(
                    View.MeasureSpec.makeMeasureSpec(dp(270), View.MeasureSpec.EXACTLY),
                    View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED));
            LinearLayout.LayoutParams lp = (LinearLayout.LayoutParams) panelScroll.getLayoutParams();
            lp.height = Math.min(panel.getMeasuredHeight(), maxH);
            panelScroll.setLayoutParams(lp);
            panelScroll.setVisibility(View.VISIBLE);
            root.setAlpha(0.95f);
            params.x = clamp(params.x, 0, Math.max(0, s.width() - dp(270)));
            params.y = clamp(params.y, 0, Math.max(0, s.height() - dp(48) - dp(6) - lp.height));
        } else {
            panelScroll.setVisibility(View.GONE);
            root.setAlpha(0.75f);
            snapToEdge();
        }
        windowManager.updateViewLayout(root, params);
    }

    private void snapToEdge() {
        Rect s = screen();
        int center = params.x + dp(24);
        params.x = center < s.width() / 2 ? 0 : s.width() - dp(48);
        params.y = clamp(params.y, 0, Math.max(0, s.height() - dp(48)));
        savePosition();
    }

    private void savePosition() {
        getSharedPreferences(ValleyOverlayPlugin.PREFS, Context.MODE_PRIVATE).edit()
                .putInt(ValleyOverlayPlugin.KEY_X, params.x)
                .putInt(ValleyOverlayPlugin.KEY_Y, params.y)
                .apply();
    }

    private static int clamp(int v, int lo, int hi) {
        return Math.max(lo, Math.min(hi, v));
    }

    private void teardown() {
        running = false;
        if (root != null && windowManager != null) {
            try {
                windowManager.removeView(root);
            } catch (Exception ignored) {
                // já removido
            }
        }
        root = null;
        panel = null;
        panelScroll = null;
        bubble = null;
        expanded = false;
    }

    /** Arrasta o botão; um toque curto (sem arrastar) abre ou fecha o painel. */
    private class DragListener implements View.OnTouchListener {
        private int startX;
        private int startY;
        private float touchX;
        private float touchY;
        private boolean moved;
        private final int slop = ViewConfiguration.get(OverlayService.this).getScaledTouchSlop();

        @Override
        public boolean onTouch(View v, MotionEvent e) {
            switch (e.getActionMasked()) {
                case MotionEvent.ACTION_DOWN:
                    startX = params.x;
                    startY = params.y;
                    touchX = e.getRawX();
                    touchY = e.getRawY();
                    moved = false;
                    return true;
                case MotionEvent.ACTION_MOVE: {
                    float dx = e.getRawX() - touchX;
                    float dy = e.getRawY() - touchY;
                    if (!moved && Math.abs(dx) < slop && Math.abs(dy) < slop) return true;
                    moved = true;
                    Rect s = screen();
                    int w = Math.max(dp(48), root.getWidth());
                    int h = Math.max(dp(48), root.getHeight());
                    params.x = clamp(startX + Math.round(dx), 0, Math.max(0, s.width() - w));
                    params.y = clamp(startY + Math.round(dy), 0, Math.max(0, s.height() - h));
                    windowManager.updateViewLayout(root, params);
                    return true;
                }
                case MotionEvent.ACTION_UP:
                    if (!moved) {
                        setExpanded(!expanded);
                    } else if (!expanded) {
                        snapToEdge();
                        windowManager.updateViewLayout(root, params);
                    } else {
                        savePosition();
                    }
                    return true;
                default:
                    return false;
            }
        }
    }
}
