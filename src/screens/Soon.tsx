export function Soon({ title, note }: { title: string; note?: string }) {
  return (
    <section className="panel">
      <h1>{title}</h1>
      <p>{note ?? 'Esta página ainda está sendo construída.'}</p>
      <p className="muted">Quando ela chegar, aparece aqui sem você precisar fazer nada.</p>
    </section>
  );
}
