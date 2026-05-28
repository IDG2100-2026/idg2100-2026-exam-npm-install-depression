export async function getTournaments() {
  const response = await fetch(
    'http://localhost:4567/api/tournaments'
  );

  const data = await response.json();

  return data;
}