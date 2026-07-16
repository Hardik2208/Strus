export class MilestoneDeadlineUtil {
  private static readonly MILLISECONDS_PER_DAY =
    24 * 60 * 60 * 1000;

  static calculateDeadline(
    startedAt: Date,
    allocatedDays: number,
    extensionDays: number
  ): Date {
    return new Date(
      startedAt.getTime() +
        (allocatedDays + extensionDays) *
          this.MILLISECONDS_PER_DAY
    );
  }

  static isLate(
    submittedAt: Date,
    startedAt: Date,
    allocatedDays: number,
    extensionDays: number
  ): boolean {
    return (
      submittedAt >
      this.calculateDeadline(
        startedAt,
        allocatedDays,
        extensionDays
      )
    );
  }
}