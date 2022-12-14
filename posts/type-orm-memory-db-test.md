---
title: 'TypeORM에서 메모리DB(pg-mem) 사용해서 테스트 코드 만들기'
date: 'October 23, 2022'
author: '김형진'
excerpt: 'TypeORM에서 메모리 DB 사용해서 테스트 하는 방법을 정리한다.'
cover_image: 'https://d33wubrfki0l68.cloudfront.net/e937e774cbbe23635999615ad5d7732decad182a/26072/logo-small.ede75a6b.svg'
---

repository를 테스트 할 때 mock을 사용하면 정확한 테스트가 어렵고 그렇다고 실제 DB를 사용하자니 설정이라든가 롤백작업을 해주어야 한다.

그래서 메모리DB를 사용해서 테스트를 하는 경우가 있는 데 TypeORM에서 메모리 DB 사용해서 테스트 하는 방법을 정리한다.

### pg-mem 설치

```bash
npm i --save pg-mem
```

### pg-mem import 및 db 가져오기

```ts
import { DataType, newDb } from 'pg-mem';

const db = newDb();
```

### current_database 함수 만들기

db를 실행하면 current_database 함수가 실행이 되는 데 해당 함수가 pg-mem에는 없어서 에러가 나온다.
해당 함수를 추가해 주자

```ts
db.public.registerFunction({
  name: 'current_database',
  implementation: () => 'test',
});
```

### uuid 확장 프로그램 설치

registerExtension 함수로 필요한 확장 프로그램을 설치할 수 있다.
아래 코드는 uuid를 사용하기 위해서 추가된 설정이다.

```ts
db.registerExtension('uuid-ossp', (schema) => {
  schema.registerFunction({
    name: 'uuid_generate_v4',
    returns: DataType.uuid,
    implementation: v4,
    impure: true,
  });
});
```

### 스키마 생성

기본 스키마(public)가 아닌 다른 스키마를 사용하고 있으면 스키마를 추가해주어야 한다.

```ts
db.createSchema('donation');
```

### 테스트에 사용될 repository 만들기

Test.createTestingModule를 사용해서 repository를 만들려고 했는 데 CustomRepository 같은 경우는 테스트 하기가 쉽지 않았다.
그래서 createTypeormConnection 함수를 사용해 Connection을 만들고 Repository의 생성자에 target, manager, queryRunner을 넣는 방식으로 만들었다.

```ts
@CustomRepository(Donation)
export class DonationRepository extends Repository<Donation> {
  async getDonation(donationId: number): Promise<Donation> {
    return await this.findOne({
      where: { id: donationId },
      relations: ['records', 'records.user'],
    });
  }
.
.
.
/**
 * beforeAll
*/
const connection: Connection = await db.adapters.createTypeormConnection({
    type: 'postgres',
    entities,
    synchronize: true,
});

let tempDonationRepository = connection.getRepository(Donation);

donationRepository = new DonationRepository(tempDonationRepository.target, tempDonationRepository.manager, tempDonationRepository.queryRunner);
```

### 테스트

```ts
it('getDonation()', () => {
  let donation = donationRepository.getDonation(1);
  expect(donation).not.toBeNull();
});

afterAll(async () => {
  let connection = getConnection();

  if (connection) {
    connection.close();
  }
});
```
