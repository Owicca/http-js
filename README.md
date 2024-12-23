### requirements:
- nodejs >= 20
- netcat


### steps:
1. run `npm i && npm i --dev`
1. run `npx tsx main.ts`

### requests examples:
1. copy `request.txt.example` to `request.txt`
2. modify `request.txt`
2. run `nc localhost 3000 < request.txt`

`openssl s_client -verify_quiet -quiet -connect example.com:443`

http 1.0 plain text request:
```txt
GET / HTTP/1.0
Host: example.com
```