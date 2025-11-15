import { MemberLevel } from '@prisma/client';

export const memberLevelUp = (
  totalPoints: number,
  config: any,
): MemberLevel => {
  if (totalPoints >= config.DIAMOND) return 'DIAMOND';
  if (totalPoints >= config.GOLD) return 'GOLD';
  if (totalPoints >= config.SILVER) return 'SILVER';
  return 'BRONZE';
};
