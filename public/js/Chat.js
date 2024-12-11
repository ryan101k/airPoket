// 금칙어 목록
const forbiddenWords = ['욕설', '금칙어1', '금칙어2'];

// DOM 요소 가져오기
const commentsContainer = document.getElementById('comments-container');
const commentForm = document.getElementById('comment-form');
const commentInput = document.getElementById('comment-input');
const filterWarning = document.getElementById('filter-warning');

// WebSocket 연결
const ws = new WebSocket('ws://localhost:8888');

let comments = []; // 댓글 배열 저장

// 댓글 카드 생성 함수
function createCommentCard(content) {
  const commentCard = document.createElement('div');
  commentCard.className = 'comment-card';
  commentCard.textContent = content;
  return commentCard;
}

// 랜덤 댓글 표시 함수
function showRandomComment() {
  if (comments.length === 0) return; // 댓글이 없으면 종료

  // 랜덤 인덱스 선택
  const randomIndex = Math.floor(Math.random() * comments.length);
  const randomComment = comments[randomIndex];

  // 새 댓글 표시
  const newCard = createCommentCard(randomComment.content);
  commentsContainer.appendChild(newCard);

  // 애니메이션 활성화
  setTimeout(() => {
    newCard.classList.add('active');
  }, 10);

  // 일정 시간 후 댓글을 스크롤하는 효과
  setTimeout(() => {
    newCard.classList.remove('active');
    setTimeout(() => {
      newCard.remove(); // 애니메이션 완료 후 제거
      showRandomComment(); // 새로운 댓글 표시
    }, 1000); // 애니메이션 시간과 일치
  }, 3000); // 3초 후에 댓글 제거
}

// WebSocket 메시지 수신 이벤트
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);

  if (message.type === 'new_comment') {
    const comment = message.data;
    comments.push(comment); // 새 댓글 배열에 추가
    if (comments.length === 1) showRandomComment(); // 첫 댓글이 추가되면 표시
  }

  if (message.type === 'delete_comment') {
    const { id } = message.data;
    // 댓글 배열에서 삭제
    comments = comments.filter((comment) => comment.id !== id);
  }
});

// 서버에서 댓글 목록 가져오기
const fetchComments = async () => {
  try {
    const response = await fetch('http://localhost:3927/comments');
    const data = await response.json();

    comments = data; // 댓글 배열 갱신
    if (comments.length > 0) {
      showRandomComment(); // 첫 댓글 표시
    }
  } catch (error) {
    console.error('댓글 가져오기 오류:', error);
  }
};

// 알림 메시지 표시 함수
const showAlert = (message) => {
  filterWarning.textContent = message;
  filterWarning.style.display = 'block';

  // 3초 후 경고 메시지 숨기기
  setTimeout(() => {
    filterWarning.style.display = 'none';
  }, 3000);
};

// 댓글 추가 이벤트
commentForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const comment = commentInput.value.trim();

  // 금칙어 필터링
  const containsForbiddenWord = forbiddenWords.some((word) => comment.includes(word));
  if (containsForbiddenWord) {
    showAlert('금칙어가 포함된 메시지는 보낼 수 없습니다.');
    return;
  }

  try {
    const response = await fetch('http://localhost:3927/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }), // 서버가 기대하는 키와 일치
    });

    if (response.ok) {
      commentInput.value = ''; // 입력 필드 초기화
    } else if (response.status === 429) {
      showAlert('메시지를 너무 자주 보냈습니다. 잠시 후 다시 시도하세요.');
    } else {
      showAlert('댓글 추가에 실패했습니다.');
    }
  } catch (error) {
    console.error('댓글 추가 요청 오류:', error);
    showAlert('서버와 연결할 수 없습니다. 다시 시도해주세요.');
  }
});

// 페이지 로드 시 댓글 목록 가져오기
fetchComments();
