---
title: 'TypeScript satisfies'
date: 'November 20, 2022'
author: '김형진'
excerpt: 'TypeScript 4.9 satisfies 문법'
cover_image: '/images/posts/typescript/ts4_9.png'
---

# satisfies 연산자

TypeScript 개발자는 종종 딜레마에 직면합니다. 우리는 일부 표현식이 일부 유형과 일치하는지 확인하고 추론 목적으로 해당 표현식의 가장 구체적인 유형을 유지하기를 원합니다.


## 일반적인 방법

```ts
// 객체는 튜플 또는 문자열이 될 수 있다.
const palette = {
    red: [255, 0, 0],
    green: "#00ff00",
    bleu: [0, 0, 255] //  bleu - 오타 발생
};

// red는 배열로 사용된다.
const redComponent = palette.red.at(0);

// green은 문자열로 사용된다.
const greenNormalized = palette.green.toUpperCase();
```


## 개선된 버전

- Colors라는 type을 만들어서 들어갈 수 있는 값을 지정한다.
- RGB라는 number값 3개를 가지는 배열을 선언
- scabiesPalette값은 Colors의 키값과 문자열 혹은 RGB타입의 값이 들어온다.

```ts
type Colors = "red" | "green" | "blue";

type RGB = [red: number, green: number, blue: number];

const scabiesPalette: Record<Colors, string | RGB> = {
    red: [255, 0, 0],
    green: "#00ff00",
    bleu: [0, 0, 255] //  오타를 올바르게 감지됩니다.
};

// 그러나 'red'의 경우 문자열이 올 수 있습니다.
const redComponent2 = palette.red.at(0);
type Colors = "red" | "green" | "blue";

type RGB = [red: number, green: number, blue: number];

const scabiesPalette: Record<Colors, string | RGB> = {
    red: [255, 0, 0],
    green: "#00ff00",
    bleu: [0, 0, 255] //  오타를 올바르게 감지됩니다.
};

// 그러나 'red'의 경우 문자열이 올 수 있습니다.
const redComponent2 = palette.red.at(0);
```

## satisfies를 사용한 문법

```ts
const satisfiesPalette = {
    red: [255, 0, 0],
    green: "#00ff00",
    blee: [0, 0, 0] //  오타를 올바르게 감지됩니다.
} satisfies Record<Colors, string | RGB>; // satisfies Record<Colors, string | RGB> 빼면 오류가 사라진다.
```

## 캐스팅

```ts
// 타입정의
const object: {  a: number,  b: { a: number }} = {  
     a: 10,  
     b: { a: 10, b: 20 } // error  
}  
// as
const object2 = {  
    a: 10,  
    b: { a: 10, b: 20 } as { a: number }, // no error  
}  
// satisfies
const object3 = {  
    a: 10,  
    b: { a: 10, b: 20 } satisfies { a: number }, // error  
}  
```

# 참조

- https://devblogs.microsoft.com/typescript/announcing-typescript-4-9
- https://github.com/microsoft/TypeScript/issues/47920