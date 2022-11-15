---
title: '+1, 전위 후위 ++ 연산 ByteCode 비교'
date: 'November 13, 2022'
author: '김형진'
excerpt: '+1, 전위 후위 ++ 연산 ByteCode 비교'
cover_image: 'https://d33wubrfki0l68.cloudfront.net/e937e774cbbe23635999615ad5d7732decad182a/26072/logo-small.ede75a6b.svg'
---

# +1, 전위 후위 ++ 연산 ByteCode 비교

- C++로 작성된 자바스크립트 & 웹 어셈블리 엔진이다.
- Chrome, NodeJs에서 사용되고 있는 자바스크립트 엔진, ECMAScript와 Web Assembly를 표준에 맞게 구현하고 있다.
- Chakra(차크라), 마이크로소프트의 엣지 웹 브라우저에 적용된 자바스크립트 엔진
- SpiderMonkey(스파이더몽키), 모질라 파이어 폭스에 적용된 자바스크립트 엔진

## 바이트 코드가 만들어지기 까지

![V8](/images/posts/bytecode/V8_실행.png)

소스코드 -> 파서(Parser) -> 추상 구문 트리(Abstract Syntax Tree) -> Ignition(자바스크립트 -> 바이트 코드)

- 바이트 코드로 변환함으로써 원본 코드를 다시 파싱하지 않아도 되고 코드 실행 시 메모리 공간을 아낄 수 있다.
- 이 중 자주 사용되는 코드는 TurboFan으로 보내져서 Optimized Machine Code, 최적화된 코드로 다시 컴파일 된다.
- 사용이 줄어 들면 Deoptimiziong 된다.

## 바이트 코드 만들기

NodeJs 옵션으로 --print-bytecode으로 실행시키면 얻을 수 있다.

```bash
node --print-bytecode [파일이름]
```

## 소스코드

```js
function plus() {
  let aaa = 1;
  let bbb = aaa + 1;
  let ccc = aaa++;
  let ddd = ++aaa;
}

plus();
```

### 변수 할당

```js
let aaa = 1;
    /**
     *    41 S> 0x3290c693859e @    0 : 0d 01             LdaSmi [1]
     *    누산기에 상수 값 1을 넣는다.
     *          0x3290c69385a0 @    2 : c3                Star0
     *    현재 누산기에 있는 값을 레지스터 r0에 저장한다. r0은 지역변수를 위한 레지스터
```

### + 연산

```js
let bbb = aaa + 1;
    /**
     *    62 S> 0x3290c69385a1 @    3 : 44 01 00          AddSmi [1], [0]
     *    누산기에 상수 값 1을 더한다. 누산기에는 r0에 저장된 값이 있으므로, 1 + 1 = 2가 된다.
     *          0x3290c69385a4 @    6 : c2                Star1
     *    현재 누산기에 있는 값을 레지스터 r1에 저장한다.
```

### 후위연산

```js
let ccc = aaa++;
/**
 *    81 S> 0x3290c69385a5 @    7 : 0b fa             Ldar r0
 *    레지스터 r0에 있는 값을 누산기에 넣는다.
 *          0x3290c69385a7 @    9 : 74 01             ToNumeric [1]
 *    누산기에 있는 값을 숫자로 변환한다.
 *          0x3290c69385a9 @   11 : bf                Star4
 *    현재 누산기에 있는 값을 레지스터 r4에 저장한다.
 *          0x3290c69385aa @   12 : 50 01             Inc [1]
 *    현재 누산기에 있는 값을 1 증가시킨다.
 *          0x3290c69385ac @   14 : c3                Star0
 *    현재 누산기에 있는 값을 레지스터 r0에 저장한다.
 *          0x3290c69385ad @   15 : 19 f6 f8          Mov r4, r2
 *    레지스터 r4에 있는 값을 레지스터 r2에 저장한다.
 * */
```

후위연산의 경우 계산 후 값을 저장하는 레지스터와 계산 전 값을 저장하는 레지스터로 나위는 것 같다.

### 전위연산

```js
let ddd = ++aaa;
/**
 *   102 S> 0x3290c69385b0 @   18 : 0b fa             Ldar r0
 *    레지스터 r0에 있는 값을 누산기에 넣는다.
 *          0x3290c69385b2 @   20 : 50 02             Inc [2]
 *    누산기에 있는 값을 1 증가시킨다.
 *          0x3290c69385b4 @   22 : c3                Star0
 *.   현재 누산기에 있는 값을 레지스터 r0에 저장한다.
 *          0x3290c69385b5 @   23 : c0                Star3
 *    현재 누산기에 있는 값을 레지스터 r3에 저장한다.
 * */
```

## 참고 자료

- [V8 Git](https://github.com/v8/v8)
- [V8 공식홈-코드 빌드](https://v8.dev/docs/source-code)
- [evan-moon.github.io](https://evan-moon.github.io/2019/06/28/v8-analysis/)
