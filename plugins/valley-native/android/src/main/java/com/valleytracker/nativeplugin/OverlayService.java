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
import android.widget.ImageView;
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
    private ImageView bubble;
    private ScrollView panelScroll;
    private LinearLayout panel;
    private WindowManager.LayoutParams params;
    private boolean expanded = false;
    /** Alvo "X" que aparece embaixo da tela enquanto o botão é arrastado. */
    private TextView dismissTarget;
    private boolean overTarget = false;
    /** Escondido pelo "X": o serviço continua, e o botão volta ao abrir o Valley Notes ou tocar na notificação. */
    private boolean dismissed = false;

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

        // Qualquer outra ação (mostrar, reinício pelo sistema) traz o botão de volta.
        dismissed = false;
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
                .setContentTitle("Valley Notes")
                .setContentText(dismissed
                        ? "Botão escondido. Toque aqui para mostrar de novo."
                        : "Botão flutuante ativo. Toque para abrir o app.")
                .setOngoing(true);

        int piFlags = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        if (dismissed) {
            Intent show = new Intent(this, OverlayService.class).setAction(ACTION_SHOW);
            b.setContentIntent(Build.VERSION.SDK_INT >= 26
                    ? PendingIntent.getForegroundService(this, 1, show, piFlags)
                    : PendingIntent.getService(this, 1, show, piFlags));
        } else {
            Intent launch = getPackageManager().getLaunchIntentForPackage(getPackageName());
            if (launch != null) b.setContentIntent(PendingIntent.getActivity(this, 0, launch, piFlags));
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

        bubble = new ImageView(this);
        bubble.setImageResource(R.drawable.valley_bubble);
        bubble.setScaleType(ImageView.ScaleType.FIT_CENTER);
        // Redondo e sem borda: a própria imagem já é um círculo com fundo transparente.
        if (Build.VERSION.SDK_INT >= 21) bubble.setElevation(dp(4));
        bubble.setOutlineProvider(android.view.ViewOutlineProvider.BACKGROUND);
        GradientDrawable circle = new GradientDrawable();
        circle.setShape(GradientDrawable.OVAL);
        circle.setColor(Color.TRANSPARENT);
        bubble.setBackground(circle);
        bubble.setContentDescription("Valley Notes: abrir ou fechar as dicas do dia");
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

    /** Depois desta pausa sem confirmar o dia, o painel pergunta "Ainda é ...?". */
    private static final long CONFIRM_AFTER_MS = 30L * 60L * 1000L;

    private SharedPreferences prefs() {
        return getSharedPreferences(ValleyOverlayPlugin.PREFS, Context.MODE_PRIVATE);
    }

    /** Dias enviados pelo app, ou null no modo antigo (só título e linhas). */
    private JSONArray days() {
        try {
            String raw = prefs().getString(ValleyOverlayPlugin.KEY_DAYS, null);
            if (raw == null) return null;
            JSONArray arr = new JSONArray(raw);
            return arr.length() > 0 ? arr : null;
        } catch (Exception e) {
            return null;
        }
    }

    private void moveDay(int delta) {
        JSONArray days = days();
        if (days == null) return;
        int index = clamp(prefs().getInt(ValleyOverlayPlugin.KEY_INDEX, 0) + delta, 0, days.length() - 1);
        prefs().edit()
                .putInt(ValleyOverlayPlugin.KEY_INDEX, index)
                .putLong(ValleyOverlayPlugin.KEY_CONFIRMED_AT, System.currentTimeMillis())
                .apply();
        fillPanel();
        if (expanded) setExpanded(true);
    }

    private void confirmDay() {
        prefs().edit().putLong(ValleyOverlayPlugin.KEY_CONFIRMED_AT, System.currentTimeMillis()).apply();
        fillPanel();
        if (expanded) setExpanded(true);
    }

    private void fillPanel() {
        if (panel == null) return;
        panel.removeAllViews();

        JSONArray days = days();
        String title;
        JSONArray lines;
        int index = 0;
        if (days != null) {
            index = clamp(prefs().getInt(ValleyOverlayPlugin.KEY_INDEX, 0), 0, days.length() - 1);
            org.json.JSONObject day = days.optJSONObject(index);
            title = day == null ? "" : day.optString("title", "");
            lines = day == null ? new JSONArray() : day.optJSONArray("lines");
        } else {
            title = prefs().getString(ValleyOverlayPlugin.KEY_TITLE, "");
            try {
                lines = new JSONArray(prefs().getString(ValleyOverlayPlugin.KEY_LINES, "[]"));
            } catch (Exception e) {
                lines = new JSONArray();
            }
        }

        // Depois de uma pausa, confirma o dia antes de mostrar as dicas.
        long confirmedAt = prefs().getLong(ValleyOverlayPlugin.KEY_CONFIRMED_AT, 0);
        if (days != null && System.currentTimeMillis() - confirmedAt > CONFIRM_AFTER_MS) {
            panel.addView(text("Ainda é " + title + " no jogo?", 15, Color.WHITE, true));
            LinearLayout row = buttonRow();
            row.addView(chip("Sim", 0xFF1F7A4D, v -> confirmDay()));
            row.addView(chip("\uD83C\uDF19 Dormi, +1 dia", 0xFF6B4BB3, v -> moveDay(1)));
            panel.addView(row);
            addHide();
            return;
        }

        panel.addView(text(title, 15, Color.WHITE, true));
        if (lines != null) {
            for (int i = 0; i < lines.length(); i++) {
                TextView t = text(lines.optString(i, ""), 13, 0xFFE6EDF3, false);
                t.setPadding(0, dp(6), 0, 0);
                panel.addView(t);
            }
        }

        if (days != null) {
            LinearLayout row = buttonRow();
            if (index > 0) row.addView(chip("\u25C0 Voltar", 0xFF3A4652, v -> moveDay(-1)));
            if (index < days.length() - 1) {
                row.addView(chip("\uD83C\uDF19 Dormi, +1 dia", 0xFF6B4BB3, v -> moveDay(1)));
            } else {
                TextView end = text("Abra o Valley Notes para carregar mais dias.", 12, 0xFFFFD38A, false);
                end.setPadding(0, dp(10), 0, 0);
                panel.addView(end);
            }
            panel.addView(row);
        }
        addHide();
    }

    private LinearLayout buttonRow() {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setPadding(0, dp(10), 0, 0);
        return row;
    }

    /** Botão em formato de pílula, com área de toque confortável. */
    private TextView chip(String label, int color, View.OnClickListener onClick) {
        TextView c = text(label, 13, Color.WHITE, true);
        c.setGravity(Gravity.CENTER);
        c.setMinHeight(dp(40));
        c.setPadding(dp(12), dp(6), dp(12), dp(6));
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(color);
        bg.setCornerRadius(dp(20));
        c.setBackground(bg);
        c.setOnClickListener(onClick);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.rightMargin = dp(8);
        c.setLayoutParams(lp);
        return c;
    }

    private void addHide() {
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
            fillPanel(); // reavalia se precisa perguntar "Ainda é ...?"

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
        hideTarget();
        root = null;
        panel = null;
        panelScroll = null;
        bubble = null;
        expanded = false;
    }

    // ---------- alvo "X" para fechar arrastando ----------

    private int targetSize() {
        return dp(64);
    }

    private int targetBottom() {
        return dp(48);
    }

    private void showTarget() {
        if (dismissTarget != null || windowManager == null) return;
        dismissTarget = new TextView(this);
        dismissTarget.setText("\u2715");
        dismissTarget.setTextColor(Color.WHITE);
        dismissTarget.setTextSize(TypedValue.COMPLEX_UNIT_SP, 24);
        dismissTarget.setGravity(Gravity.CENTER);
        GradientDrawable bg = new GradientDrawable();
        bg.setShape(GradientDrawable.OVAL);
        bg.setColor(0xCC1B1B1B);
        bg.setStroke(dp(2), 0x66FFFFFF);
        dismissTarget.setBackground(bg);
        dismissTarget.setContentDescription("Solte aqui para esconder o botão");
        int type = Build.VERSION.SDK_INT >= 26
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;
        WindowManager.LayoutParams tp = new WindowManager.LayoutParams(
                targetSize(), targetSize(), type,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE,
                PixelFormat.TRANSLUCENT);
        tp.gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
        tp.y = targetBottom();
        try {
            windowManager.addView(dismissTarget, tp);
        } catch (Exception e) {
            dismissTarget = null;
        }
    }

    private void hideTarget() {
        overTarget = false;
        if (dismissTarget != null && windowManager != null) {
            try {
                windowManager.removeView(dismissTarget);
            } catch (Exception ignored) {
                // já removido
            }
        }
        dismissTarget = null;
    }

    /** O centro do botão está perto do "X"? */
    private boolean nearTarget() {
        Rect s = screen();
        float bx = params.x + dp(24);
        float by = params.y + dp(24);
        float tx = s.width() / 2f;
        float ty = s.height() - targetBottom() - targetSize() / 2f;
        float dx = bx - tx;
        float dy = by - ty;
        return dx * dx + dy * dy < dp(80) * dp(80);
    }

    private void markOverTarget(boolean value) {
        if (value == overTarget || dismissTarget == null) return;
        overTarget = value;
        float scale = value ? 1.25f : 1f;
        dismissTarget.animate().scaleX(scale).scaleY(scale).setDuration(120).start();
        if (value) dismissTarget.performHapticFeedback(android.view.HapticFeedbackConstants.VIRTUAL_KEY);
    }

    /** Solto no "X": esconde o botão, mas deixa o serviço vivo para voltar depois. */
    private void dismissBubble() {
        teardown();
        dismissed = true;
        running = true; // o app continua vendo o serviço ativo e reenvia o botão ao ser aberto
        startForegroundCompat(); // atualiza a notificação: "toque para mostrar de novo"
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
                    if (!moved) {
                        moved = true;
                        if (expanded) {
                            // Fecha o painel sem encostar na borda, para o botão seguir o dedo.
                            expanded = false;
                            panelScroll.setVisibility(View.GONE);
                            root.setAlpha(0.75f);
                        }
                        showTarget();
                    }
                    Rect s = screen();
                    int w = Math.max(dp(48), root.getWidth());
                    int h = Math.max(dp(48), root.getHeight());
                    params.x = clamp(startX + Math.round(dx), 0, Math.max(0, s.width() - w));
                    params.y = clamp(startY + Math.round(dy), 0, Math.max(0, s.height() - h));
                    windowManager.updateViewLayout(root, params);
                    markOverTarget(nearTarget());
                    return true;
                }
                case MotionEvent.ACTION_CANCEL:
                    hideTarget();
                    return true;
                case MotionEvent.ACTION_UP:
                    if (moved && overTarget) {
                        dismissBubble();
                        return true;
                    }
                    hideTarget();
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
