export async function getTournaments() {
  const response = await fetch(
    'http://localhost:3000/api/tournaments'
  );

  const data = await response.json();

  return data;
}