export type VerificationCheck = {
  name: string;
  ok: boolean;
  detail: string;
};

export type VerificationEvidence = {
  ok: boolean;
  checks: VerificationCheck[];
};
