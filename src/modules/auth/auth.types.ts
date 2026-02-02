export type LoginResponseDTO = { token: string };

export type MeResponseDTO = {
  id: number;
  email: string;
  name: string | null;
};
