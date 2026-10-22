# MBC 조회가 URL이 아닌 응답 본문도 스트림 주소로 돌려줄 수 있다

**Symptom**: `lookupStreamUrl("mbc", ...)`가 200 응답의 본문을 형식 검사 없이 주소로 반환한다. 본문이 오류 페이지 HTML이면 `/api/radio/stream/mbc`가 200으로 그 HTML을 `url`에 담아 보낸다.

**Observed evidence**: `radio/server.ts`의 MBC 분기(`body.trim()`)를 코드 리뷰(low)가 지적했다. 조사 중 MBC 조회에 알 수 없는 채널 코드를 넣으면 서버 오류 페이지가 돌아온다는 보고가 있었지만(상태 코드는 확인 못함), 허용 목록 채널로는 재현하지 못했다.

**Suspected cause**: 응답 형식 검사가 없다. 허용된 채널 코드(`sfm`, `mfm`, `chm`)만 요청하므로 평소에는 발생하지 않고, MBC 쪽 장애나 응답 형식 변경 때 나타날 수 있다고 추정한다.

**What was tried**: 수정하지 않았다. 36개 채널 재생은 실제 앱에서 확인했고 MBC 3채널도 통과했다.

**Proposed next step**: `lookupStreamUrl`의 MBC 분기에서 본문이 `https://`로 시작하고 `.m3u8`을 포함하는지 확인하고, 아니면 오류를 던져 route가 502를 돌려주게 한 뒤 테스트를 추가한다.
