export interface IGetAccountBalanceService {
  perform(accountId: string): Promise<number>;
}
