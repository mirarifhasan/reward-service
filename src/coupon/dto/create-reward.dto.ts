export interface CreateRewardDto {
  name: string;
  startDate: Date;
  endDate: Date;
  perDayLimit: number;
  totalLimit: number;
}
