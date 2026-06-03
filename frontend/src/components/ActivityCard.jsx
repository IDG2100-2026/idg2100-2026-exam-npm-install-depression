import { useEffect, useState } from 'react';
import { getPlatformActivity } from '../api/statsApi';

function ActivityCard() {
  const [activity, setActivity] = useState(null);

useEffect(() => {
  async function loadActivity() {
    const data = await getPlatformActivity();
    console.log(data);
    setActivity(data);
  }

  loadActivity();
}, []);

  if (!activity) return <p>Loading...</p>;

  return (
    <section>
      <p>Active Players: {activity.activePlayersLastWeek}</p>
      <p>Games Played Last Week: {activity.gamesPlayedLastWeek}</p>
      <p>Available Games: {activity.availableGames}</p>
    </section>
  );
}

export default ActivityCard;