import { useParams } from "react-router";

export async function serverLoader({ params }: { params: { city: string; date: string; }; }) {
  return {
    concerts: [
      { name: "Rock Concert", venue: "Stadium", time: "8:00 PM" },
      { name: "Jazz Night", venue: "Blue Note", time: "9:00 PM" }
    ],
    city: params.city,
    date: params.date
  };
}

export default function ConcertsBycityAndDate() {
  const params = useParams();

  return (
    <div>
      <h1>Concerts in {params.city} on {params.date}</h1>
      <p>Find all the concerts happening on this date!</p>
    </div>
  );
}