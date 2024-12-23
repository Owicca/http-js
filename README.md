### requirements:
- nodejs >= 20
- netcat


### steps:
1. run `node main.js`

### requests examples:
1. modify `requests.txt`
2. run `nc localhost 3000 < requests.txt`

`openssl s_client -verify_quiet -quiet -connect example.com:443`

http 1.0 plain text request:
```txt
GET / HTTP/1.0
Host: example.com
```