
export interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  organizer: {
    id: string;
    name: string;
  };
}
