import { HttpException, HttpStatus } from '@nestjs/common';

function isValidEthAddress(str: string): boolean {
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(str);
}

export const checkIsValidEthAddress = (address: string) => {
  if (!isValidEthAddress(address)) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        error: 'Not a valid ethereum address',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
};

async function* endlessGenerator() {
  let count = 0;
  while (true) {
    yield count++;
  }
}

export const waitSeconds = (seconds: number) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

/**
 * @param {Number} maxWaitTime - max wait time in seconds; 0 means endless;
 */
export const waitAsyncResult = <T extends () => Promise<any>>(
  fetcher: T,
  maxWaitTime: number = 44,
  interval = 3,
) => {
  let isStop = false;
  const stop = () => (isStop = true);
  const promise = new Promise<NonNullable<Awaited<ReturnType<T>>>>(
    async (resolve, reject) => {
      const generator =
        maxWaitTime === 0
          ? endlessGenerator()
          : Array.from({ length: Math.floor(maxWaitTime / interval) });

      for await (const _ of generator) {
        try {
          if (isStop) {
            reject(new Error('Wait async stop'));
            return;
          }
          const res = await fetcher();
          if (res?.status === 200) {
            resolve(res);
            return;
          }
        } catch (_) {
        } finally {
          await waitSeconds(interval);
        }
      }
      reject(new Error('Wait async timeout'));
    },
  );

  return [promise, stop] as const;
};
