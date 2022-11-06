---
title: 'Next.js로 마크다운 블로그를 만들어보자'
date: 'November 07, 2022'
author: '이상훈'
excerpt: 'Next.js와 몇가지라이브러리를 통해 간단하게 블로그를 만들어보자'
cover_image: 'https://raw.githubusercontent.com/testing-library/react-hooks-testing-library/main/public/ram.png'
---

# 1. Hooks만 테스트하였을때의 장점

회사에서 진행하는 대부분의 리액트 기반 프로젝트에서 Hooks는 과거의 Container&Presentational 디자인 패턴에서 Container가 로직을 담당하고

Props로 마크업만 존재하는 Presentational 에 넘겨주는 방식에서 Container를 담당하고 있다고 보면 된다.

그러니까 비즈니스로직을 담당하고 있다고 생각하면 된다.

이렇게 분리하면 로직의 변경이 필요한 경우 hooks만 수정을 진행하는 장점과 비즈니스로직 테스트를 진행할 때

View단을 따로 띄우지 않고 간단하게 테스트를 진행할 수 있어 테스트 코드의 간결함도 높아진다는 장점이 있다.

아래는 테스트를 진행할 간단한 hooks이다.

REST API에서 데이터를 받아와 state에 저장하고 에러가 발생하면 에러상태를 보내주고와 같은 간단하고 기본적인 hooks이다.

useEffect내에서 타이밍 문제로 인해 컴포넌트가 언마운트시점에 state가 변경되는 이슈를 막고자 `AbortController`도 적용해주었다.

```javascript
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { IBasicRes, IGetRefundRes } from 'types/common';
import { AES256Decrypt } from '../utils/crypto';

const useGetDataFromId = ({ registrationId }: { registrationId: string }) => {
  const route = useRouter();
  const [refundData, setRefundData] = useState<{
    amount: number;
    dishCount: number;
    status: string;
    bankName: string;
    accountHolder: string;
    accountNumber: string;
  }>({
    amount: 0,
    dishCount: 0,
    bankName: '',
    status: '',
    accountHolder: '',
    accountNumber: '',
  });
  const [isError, setIsError] = useState<boolean>(false);
  const controller = new AbortController();

  const getDataFromId = async (id: string): Promise<IGetRefundRes | null> => {
    let data = null;
    try {
      const res = await axios.get<IBasicRes<IGetRefundRes>>(
        `/test?testId=${id}`,
      );
      const WAITING_STATUS = 'STATUS!';
      if (res.data._data) data = res.data._data;

      if (
        route.pathname === '/account' &&
        res.data._data &&
        res.data._data.status !== WAITING_STATUS
      ) {
        route.push({
          pathname: 'complete',
          query: {
            id: registrationId,
          },
        });
      }

      if (
        route.pathname === '/complete' &&
        res.data._data.status === WAITING_STATUS
      )
        route.push({
          pathname: 'account',
          query: {
            id: registrationId,
          },
        });
    } catch (err) {
      controller.signal.aborted;
      console.error(err);
    }
    return data;
  };

  useEffect(() => {
    if (!registrationId || registrationId?.length < 2) {
      setIsError(true);
      return;
    }
    //IIFE를 통해 굳이 함수의 롤을 하나로 진행하였다.
    (async () => {
      const data = await getDataFromId(registrationId);
      if (!data) {
        setIsError(true);
        return;
      }

      const {
        accountHolder,
        status,
        bankName,
        dishCount,
        amount,
        accountNumber,
      } = data;
      setRefundData({
        accountHolder,
        status,
        bankName,
        dishCount,
        amount,
        accountNumber: accountNumber ? AES256Decrypt(accountNumber) : '',
      });
    })();

    return () => controller.abort();
  }, []);

  return {
    refundData,
    isError,
  };
};

export default useGetDataFromId;

```

# 2. 테스트를 해보자

위 간단한 Hooks의 테스트는 `@testing-library/react-hooks`를 통해 진행할 수 있다.

그리고 API를 완전히 모킹하여 활용할 것이므로 `msw`를 활용하였다.

msw는 앱 실행시 `mockServiceWorker` 를 통해 실제 서버 없이 브라우저 위에서 API를 원하는데로 활용하며 만들 수 있어 개발 진행을 할 때에도 상당히 활용도가 높다.

```javascript
/* eslint-env jest */

import { renderHook } from '@testing-library/react-hooks';
import axios from 'axios';
import useGetDataFromId from '../hooks/useGetDataFromId';
import { server } from '../mock/server';

//axios의 baseURL을 해당 테스트에서도 설정해준다.
axios.defaults.baseURL = `${process.env.NEXT_PUBLIC_API_DOMAIN}`;
//router를 모킹해준다(path, push)와 같은 메서드를 사용하므로 이에 mockImplementation을 진행할 것이다.
const useRouter = jest.spyOn(require('next/router'), 'useRouter');

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('<useGetDataFromId />', () => {
  //msw의 서버를 켜준다.
  beforeAll(() => {
    server.listen();
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  const setup = ({ registrationId }: { registrationId: string }) => {
    const { result, waitForNextUpdate, rerender, waitFor } = renderHook(() =>
      useGetDataFromId({
        registrationId,
      })
    );

    return { result, waitForNextUpdate, rerender, waitFor };
  };

  it('올바른 응답을 받은 경우 state에 받은 응답을 저장함.', async () => {
    const push = jest.fn();
    //아래와 같이 useRouter()가 반환하기를 원하는 값들을 미리 실행해주고 테스트에서 이 값이 발생한 경우 원하는데로 hooks로직이 동작하는지 판별해준다.
    useRouter.mockImplementation(() => {
      return {
        push,
        pathname: '/account',
        route: '/',
        asPath: '/',
        query: '',
      };
    });
    const { result, waitFor } = setup({
      registrationId: 'TEST_SUCCESS',
    });

    expect(result.current.refundData.accountHolder).toEqual('');

    await waitFor(() => {
      expect(result.current.refundData.accountHolder).toEqual('SOMEONE');
      expect(result.current.refundData.amount).toEqual(100);
    });
  });

  it('서버 에러가 발생한 경우 isError가 true로 반환되어야 한다.', async () => {
    const push = jest.fn();
    useRouter.mockImplementation(() => {
      return {
        push,
        pathname: '/account',
        route: '/',
        asPath: '/',
        query: '',
      };
    });
    const { result, waitFor } = setup({
      registrationId: 'TEST_FAIL',
    });

    expect(result.current.isError).toBeFalsy();

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy();
    });
  });

  it('account 경로로 들어가 status가 이미 제출되어 있는 경우 complete페이지로 이동', async () => {
    const registrationId = 'NOT_WAITING_INFO_WITH_ACCOUNT_PAGE';
    const push = jest.fn();
    useRouter.mockImplementation(() => {
      return {
        push,
        pathname: '/account',
        route: '/',
        asPath: '/',
        query: '',
      };
    });
    const { result, waitFor } = setup({
      registrationId,
    });

    expect(result.current.refundData.accountHolder).toEqual('');

    await waitFor(() => {
      expect(result.current.isError).toBeFalsy();
      expect(result.current.refundData.status).toEqual('SUBMITTED');
      expect(push).toHaveBeenCalledWith({
        pathname: 'complete',
        query: {
          id: registrationId,
        },
      });
    });
  });

  it('complete 경로로 들어가 status가 아직 제출되어있지 않은 경우 account페이지로 이동', async () => {
    const registrationId = 'WAITING_INFO_WITH_COMPLETE_PAGE';
    const push = jest.fn();
    useRouter.mockImplementation(() => {
      return {
        push,
        pathname: '/complete',
        route: '/',
        asPath: '/',
        query: '',
      };
    });
    const { result, waitFor } = setup({
      registrationId,
    });

    expect(result.current.refundData.accountHolder).toEqual('');

    await waitFor(() => {
      expect(result.current.isError).toBeFalsy();
      expect(result.current.refundData.status).toEqual('ACCOUNT_INFO_WAITING');
      expect(push).toHaveBeenCalledWith({
        pathname: 'account',
        query: {
          id: registrationId,
        },
      });
    });
  });
});
```

msw의 서버핸들러는 아래와 같이 간단하게 구성하였다. 원래 API명세에 registrationId의 값에 따라 다양한 요청일 것이므로 이 params를 활용하였다.

```javascript
import { rest } from 'msw';
import { IBasicRes } from 'types/common';

const BASE_RESPONE = {
  _data: {
    amount: 100,
    dishCount: 100,
    status: 'ACCOUNT_INFO_WAITING',
    bankName: 'BANKBANK',
    accountHolder: 'SOMEONE',
    accountNumber: '123512302139',
  },
  _message: 'OK',
  _statusCode: '?',
  _status_code: '!!',
};

const serverAPI = (path: string) => {
  return new URL(path, 'https://test.test.com').toString();
};

const useGetDataFromIdHanlder = [
  rest.get(serverAPI(`refund`), (req, res, ctx) => {
    const registrationId = req.url.searchParams.get('registrationId');
    if (registrationId === 'TEST_SUCCESS') {
      return res(
        ctx.status(200),
        ctx.json({
          ...BASE_RESPONE,
        })
      );
    }

    if (registrationId === 'TEST_FAIL') {
      return res(
        ctx.status(500),
        ctx.json({
          ...BASE_RESPONE,
          _data: {
            ...BASE_RESPONE._data,
            amount: null,
            dishCount: null,
            status: 'SERVER_ERROR',
          },
        })
      );
    }

    if (registrationId === 'NOT_WAITING_INFO_WITH_ACCOUNT_PAGE') {
      return res(
        ctx.status(200),
        ctx.json({
          ...BASE_RESPONE,
          _data: {
            ...BASE_RESPONE._data,
            status: 'SUBMITTED',
          },
          _message: 'FAIL',
        })
      );
    }

    if (registrationId === 'WAITING_INFO_WITH_COMPLETE_PAGE') {
      return res(
        ctx.status(200),
        ctx.json({
          ...BASE_RESPONE,
        })
      );
    }
  }),

  rest.post(serverAPI('refund'), async (req, res, ctx) => {
    const body = await req.json();
    if (body.accountHolder === 'SUCCESS_PERSON') {
      return res(
        ctx.status(200),
        ctx.json <
          IBasicRes <
          string >>
            {
              _data: '',
              _message: '',
              _statusCode: '200',
              _status_code: 200,
            }
      );
    }

    if (body.accountHolder === 'FAIL_PERSON') {
      return res(
        ctx.status(500),
        ctx.json <
          IBasicRes <
          string >>
            {
              _data: '',
              _message: '서버 에러메시지 입니다.',
              _statusCode: '500',
              _status_code: 500,
            }
      );
    }
  }),
];

export default useGetDataFromIdHanlder;
```

# 더 하면 좋을 것

위의 msw를 활용하여 실제 개발에도 백엔드 API의 개발이 늦는 경우 명세만 맞춰놓은 상태에서 프론트에서 빠르게 개발을 진행할 수 있으므로 이를 활용해보면 좋다.

그리고 Cypress에서도 msw를 활용한 테스트를 진행할 수 있으므로 한번 잘 만들어놓은 handler들을 E2E테스트에서도 활용해보면 좋다.

# 참고

- [NPM-msw](https://www.npmjs.com/package/msw)
- [NPM-@testing-library/react-hooks](https://www.npmjs.com/package/@testing-library/react-hooks)
