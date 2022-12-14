---
title: 'TypeScript에서 데코레이터 사용하기'
date: 'October 30, 2022'
author: '김형진'
excerpt: 'TypeScript에서 데코레이터 사용하기'
cover_image: 'https://d33wubrfki0l68.cloudfront.net/e937e774cbbe23635999615ad5d7732decad182a/26072/logo-small.ede75a6b.svg'
---

# 데코레이터

TypeScript 및 ES6에 클래스가 도입됨에 따라, 클래스 및 클래스 멤버에 어노테이션을 달거나 수정하기 위해 추가 기능이 필요한 특정 시나리오가 있습니다. 데코레이터는 클래스 선언과 멤버에 어노테이션과 메타-프로그래밍 구문을 추가할 수 있는 방법을 제공합니다. 데코레이터는 JavaScript에 대한 2단계 제안이며 TypeScript의 실험적 기능으로 이용 가능합니다.

## 설정
---

### 명령줄

```bash
tsc --target ES5 --experimentalDecorators
```

###  tsconfig.json

```json
{
    "compilerOptions": {
        "target": "ES5",
        "experimentalDecorators": true
    }
}
```

## 데코레이터 합성
---

```ts
function first() {  // 데코레이터 팩토리(Decorator Factories)
    console.log("first(): factory evaluated");
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("first(): called");
    };
}

function second() {
    console.log("second(): factory evaluated");
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("second(): called");
    };
}

class ExampleClass {
    @first()
    @second()
    method() {
        console.log("method(): called");
    }
}

/**
first(): factory evaluated
second(): factory evaluated
second(): called
first(): called
*/
```

데코레이터 함수 실행 후에 하나씩 리턴되는 함수 실행

## 데코레이터 선언부 코드
---

```ts
declare type ClassDecorator = <TFunction extends Function>(target: TFunction) => TFunction | void;
declare type PropertyDecorator = (target: Object, propertyKey: string | symbol) => void;
declare type MethodDecorator = <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;
declare type ParameterDecorator = (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
```

## 클래스 데코레이터(Class Decorator)
---

### 1번째 예제

```ts
function sealed(constructor: Function) {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}

@sealed
class BugReport {
    type = "report";
    title: string;

    constructor(t: string) {
        this.title = t;
    }
}

let bugReport = new BugReport("test");
console.log(`bugReport = ${JSON.stringify(bugReport)}`);

/*
bugReport = {"type":"report","title":"test"}
*/
```

생성자를 수정 불가능하게 설정하고 있다.


### 2번째 예제

```ts
function ClassDecorator(constructor: Function) {
    constructor.prototype.test = function () {
        console.log("test");
    }
}

@ClassDecorator
class Test {
    test() {}
}
/**
test
*/

function ClassDecorator2<T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
        constructor(...args: any[]) {
            super(args);
        }

        public test() {
            console.log("test2");
        }
    };
}

@ClassDecorator2
class Test {
    test() {}
}

let test = new Test();
test.test();

/**
test2
*/
```

* 프로토타입으로 프로퍼티, 메서드 구현 가능하다.
* 제너릭 <T extends { new (...args: any[]): {} }>를 사용해서 클래스 구현부를 리턴 가능하다.
* <T extends { new (...args: any[]): {} }> : any[] 배열의 매개변수를 가지는 생성자가 포함된 클래스

## 메서드 데코레이터(Method Decorator)
---

```ts
function enumerable(value: boolean) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        /**
         * 1. 정적 멤버에 대한 클래스의 생성자 함수 또는 인스턴스 멤버에 대한 클래스의 프로토타입입니다.
         * 2. 멤버의 이름
         * 3. 멤버의 프로퍼티 설명자
         * */
        console.log(`target = ${JSON.stringify(target)}`);
        console.log("propertyKey = " + propertyKey);
        console.log(`descriptro = ${JSON.stringify(descriptor)}`);
        descriptor.enumerable = value;
    };
}

class Greeter {
    greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }

    @enumerable(false)
    greet() {
        return "Hello, " + this.greeting;
    }
}

/**
target = {}
propertyKey = greet
descriptro = {"writable":true,"enumerable":false,"configurable":true}
*/
```

### descriptor

* configurable : 속성의 값을 변경할 수 있고, 객체에서 삭제할 수도 있으면 true입니다. 기본 값은 false입니다.
* enumerable : 속성이 객체의 속성 열거 시 노출되면 true입니다. 기본 값은 false입니다. 데이터 서술자는 다음의 키를 선택적으로 포함할 수 있습니다.
* value : 속성에 연관된 값입니다. 유효한 JavaScript 값(숫자, 객체, 함수 등)은 모두 사용할 수 있습니다. 기본 값은 undefined입니다.
* writable : 할당 연산자 (en-US)로 속성의 값을 바꿀 수 있으면 true입니다. 기본 값은 false입니다.


## 프로퍼티 데코레이터(Property Decorator)
---

```ts
import "reflect-metadata";

const formatMetadataKey = Symbol("format");

function format(formatString: string) {
    return Reflect.metadata(formatMetadataKey, formatString);
}
function getFormat(target: any, propertyKey: string) {
    return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
}

function property(target: any, propertyKey: string) {   // 기본형
    console.log(`target = ${JSON.stringify(target)}`);
    console.log(`propertyKey = ${propertyKey}`);
}

class Greeter {
    @format("Hello, %s")
    greeting: string;

    @property
    sss: string;

    constructor(message: string) {
        this.greeting = message;
        this.sss = "sss";
    }
    greet() {
        let formatString = getFormat(this, "greeting");
        return formatString.replace("%s", this.greeting);
    }
}
// 실행
let greeter = new Greeter("world");
console.log(greeter.greet());

/**
target = {}
propertyKey = sss
Hello, world
*/
```

greeting 매개변수에 키워드 format으로 "Hello, %s" 메타데이터를 설정한다.
getFormat 함수로 설정한 메타데이터 값을 가져온다.
가져온 데이터에서 "%s" 문자열을 변환한다.


## 매개변수 데코레이터(Parameter Decorator)

```ts
import "reflect-metadata";
const requiredMetadataKey = Symbol("required");

function required(target: Object, propertyKey: string | symbol, parameterIndex: number) {
    console.log(`target = ${JSON.stringify(target)}`);
    console.log(`propertyKey = ${String(propertyKey)}`);
    console.log(`parameterIndex = ${parameterIndex}`);

    let existingRequiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];
    existingRequiredParameters.push(parameterIndex);
    Reflect.defineMetadata( requiredMetadataKey, existingRequiredParameters, target, propertyKey);
}


class BugReport {
    type = "report";
    title: string;

    constructor(t: string) {
        this.title = t;
    }

    print(@required verbose: boolean) {
        if (verbose) {
            return this.title;
        } else {
            return `type: ${this.type}\ntitle: ${this.title}`;
        }
    }
}

let bugReport = new BugReport("test");
console.log(`bugReport.print(true) = ${bugReport.print(true)}`);
console.log(`bugReport.print(false) = ${bugReport.print(false)}`);

/**
target = {}
propertyKey = print
parameterIndex = 0
bugReport.print(true) = test
bugReport.print(false) = type: report
title: test
*/
```


## 참고자료

* https://www.typescriptlang.org/ko/docs/handbook/decorators.html
* https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty