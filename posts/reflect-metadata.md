---
title: 'reflect-metadata 사용하기'
date: 'November 6, 2022'
author: '김형진'
excerpt: 'reflect-metadata 사용하기'
cover_image: 'https://d33wubrfki0l68.cloudfront.net/e937e774cbbe23635999615ad5d7732decad182a/26072/logo-small.ede75a6b.svg'
---

# reflect-metadata

런타임에 클래스, 함수에 데이터를 조작할 수 있다.

## 설정

tsconfig.json에 emitDecoratorMetadata 설정 필요

```json
emitDecoratorMetadata: true
```

```bash
npm i --save reflect-metadata
```
 

## 사용법

```ts
  const aaaa = {
    bbbb: 'ccc'
  };

  // metadataKey로 데이터 설정 및 조회
  Reflect.defineMetadata('test', 'test2', aaaa);
  const test = Reflect.getMetadata('test', aaaa);
  console.log(`aaaa: ${JSON.stringify(aaaa)}`);
  console.log(`test = ${test}`);


  Reflect.defineMetadata('test2', 'test3', aaaa, 'bbbb');
  const test2 = Reflect.getMetadata('test2', aaaa, 'bbbb');
  console.log(`test2 = ${test2}`);

/*
aaaa: {"bbbb":"ccc"}
test = test2
test2 = test3
*/
```

### 데코레이터와 같이 사용하기

```ts
class ReflectClass {
    data: string = 'reflect data';

    @reflectDecorator
    testFun(): void {
        console.log('aaaaaaaa');
    }
}

function reflectDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log(`target = ${JSON.stringify(target)}`);
    console.log(`propertyKey = ${propertyKey}`);
    console.log(`descriptor = ${JSON.stringify(descriptor)}`);

    Reflect.defineMetadata('key', 1234, target, propertyKey);
}

const metadata = Reflect.getMetadata('secret', ReflectClass.prototype, 'testFun');

console.log(`metadata = ${Reflect.getMetadata('key', ReflectClass.prototype, 'testFun')}`); //1234
console.log(`ReflectClass = ${JSON.stringify(ReflectClass)}`);

/*
target = {}
propertyKey = testFun
descriptor = {"writable":true,"enumerable":false,"configurable":true}
metadata = 1234
ReflectClass = undefined
*/
```

## 참고사이트


* [npm](https://www.npmjs.com/package/reflect-metadata)
* [Document](https://rbuckton.github.io/reflect-metadata)
* [github](https://github.com/rbuckton/reflect-metadata#api)