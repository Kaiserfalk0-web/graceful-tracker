import { useLocalStorage } from "./useLocalStorage";

export interface ChurchProfile {
  churchName: string;
  pastorName: string;
  phone: string;
  email: string;
  address: string;
  denomination: string;
  website: string;
  about: string;
}

const defaultProfile: ChurchProfile = {
  churchName: "GraceTrack Church",
  pastorName: "",
  phone: "",
  email: "",
  address: "",
  denomination: "",
  website: "",
  about: "",
};

export function useChurchProfile() {
  const [profile, setProfile] = useLocalStorage<ChurchProfile>("gracetrack_profile", defaultProfile);
  return { profile, setProfile };
}
