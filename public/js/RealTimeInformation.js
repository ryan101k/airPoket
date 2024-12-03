// DOM 요소 가져오기
const regionSelect = document.getElementById('region');
const stationSelect = document.getElementById('station');
const today = document.getElementById('today');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// 현재 날짜 표시
function displayCurrentDate() {
  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  today.textContent = `현재 날짜: ${formattedDate}`;
}

// 데이터 검색 함수
async function fetchData() {
  const region = regionSelect.value;
  const station = stationSelect.value;

  try {
    // API 호출
    const airResponse = await fetch('http://localhost:3000/realTime/air');
    const metalResponse = await fetch('http://localhost:3000/realTime/metal');

    const airData = await airResponse.json();
    const metalData = await metalResponse.json();

    // 선택된 옵션에 따른 데이터 필터링
    const filteredAirData = airData.filter(item => {
      return (region === 'all' || item.region === region || item.city_name == region) &&
             (station === 'all' || item.station_name === station);
    });

    updateTableData(filteredAirData, 'air-data');
    updateTableData(metalData, 'metal-data'); // 중금속 데이터는 필터링 필요 시 로직 추가
  } catch (error) {
    console.error('데이터를 가져오는 중 에러 발생:', error);
  }
}

// 테이블 업데이트 함수
function updateTableData(data, tableId) {
  const tableBody = document.getElementById(tableId);
  tableBody.innerHTML = '';

  data.forEach(row => {
    const tr = document.createElement('tr');
    if (tableId === 'air-data') {
      tr.innerHTML = `
        <td>${row.region}</td>
        <td>${row.station_name}</td>
        <td>${row.hour}</td>
        <td>${row.weighted_score}</td>
        <td>${row.PM25}</td>
        <td>${row.PM19}</td>
        <td>${row.SO2}</td>
        <td>${row.CO}</td>
        <td>${row.O3}</td>
        <td>${row.NO2}</td>
      `;
    } else if (tableId === 'metal-data') {
      tr.innerHTML = `
        <td>${row.city_name}</td>
        <td>${row.HOUR}</td>
        <td>${row.Pb}</td>
        <td>${row.Ni}</td>
        <td>${row.Mn}</td>
        <td>${row.Zn}</td>
        <td>${row.S}</td>
      `;
    }
    tableBody.appendChild(tr);
  });
}

// 탭 전환 이벤트
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const target = button.dataset.target;

    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    button.classList.add('active');
    document.getElementById(target).classList.add('active');
  });
});

// 페이지 로드 시 초기 설정
document.addEventListener('DOMContentLoaded', () => {
  displayCurrentDate();
  fetchData(); // 초기 데이터 로드
});

// 옵션 변경 시 데이터 검색
regionSelect.addEventListener('change', fetchData);
stationSelect.addEventListener('change', fetchData);
