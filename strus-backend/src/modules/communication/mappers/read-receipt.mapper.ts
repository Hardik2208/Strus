export interface ReadReceiptResponse {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  readAt: Date | null;
}

export class ReadReceiptMapper {
  static toResponse(
    receipt: {
      lastReadAt: Date | null;

      user: {
        id: string;

        profile: {
          username: string;
          firstName: string;
          lastName: string;
          avatarUrl: string | null;
        } | null;
      };
    }
  ): ReadReceiptResponse {
    return {
      id: receipt.user.id,
      username: receipt.user.profile?.username ?? null,
      firstName: receipt.user.profile?.firstName ?? null,
      lastName: receipt.user.profile?.lastName ?? null,
      avatarUrl: receipt.user.profile?.avatarUrl ?? null,
      readAt: receipt.lastReadAt,
    };
  }

  static toResponseList(
    receipts: {
      lastReadAt: Date | null;

      user: {
        id: string;

        profile: {
          username: string;
          firstName: string;
          lastName: string;
          avatarUrl: string | null;
        } | null;
      };
    }[]
  ): ReadReceiptResponse[] {
    return receipts.map((receipt) =>
      ReadReceiptMapper.toResponse(receipt)
    );
  }
}