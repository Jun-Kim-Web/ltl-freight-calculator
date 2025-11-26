// 기록 저장 배열
let history = [];

// 로컬 스토리지에서 기록 불러오기
function loadHistoryFromStorage() {
    try {
        const savedHistory = localStorage.getItem('ltlCalculatorHistory');
        if (savedHistory) {
            history = JSON.parse(savedHistory);
            renderHistoryTable();
        }
    } catch (error) {
        console.warn('Failed to load history from storage:', error);
        history = [];
    }
}

// 로컬 스토리지에 기록 저장
function saveHistoryToStorage() {
    try {
        localStorage.setItem('ltlCalculatorHistory', JSON.stringify(history));
    } catch (error) {
        console.warn('Failed to save history to storage:', error);
    }
}

// 상수 정의
const VALIDATION_LIMITS = {
    MAX_VALUE: 10000,
    MIN_VALUE: 0.01,
    MAX_DIMENSION: 1000, // 최대 치수 (인치)
    MAX_WEIGHT: 10000    // 최대 무게 (파운드)
};

// LTL Class 기준 (NMFC 표준)
const FREIGHT_CLASS_RANGES = [
    { minDensity: 50, class: 50 },
    { minDensity: 35, class: 55 },
    { minDensity: 30, class: 60 },
    { minDensity: 22.5, class: 65 },
    { minDensity: 15, class: 70 },
    { minDensity: 13.5, class: 77.5 },
    { minDensity: 12, class: 85 },
    { minDensity: 10.5, class: 92.5 },
    { minDensity: 9, class: 100 },
    { minDensity: 8, class: 110 },
    { minDensity: 7, class: 125 },
    { minDensity: 6, class: 150 },
    { minDensity: 5, class: 175 },
    { minDensity: 4, class: 200 },
    { minDensity: 3, class: 250 },
    { minDensity: 2, class: 300 },
    { minDensity: 1, class: 400 }
];

// 부피 변환 상수 (in³ → ft³)
const CUBIC_INCHES_PER_CUBIC_FOOT = 1728;

// 입력값 검증 함수
function validateInput(value, fieldName, type = 'general') {
    if (isNaN(value) || value <= 0) {
        throw new Error(`Please enter a valid positive number for ${fieldName}`);
    }
    
    const maxValue = type === 'dimension' ? VALIDATION_LIMITS.MAX_DIMENSION : 
                    type === 'weight' ? VALIDATION_LIMITS.MAX_WEIGHT : 
                    VALIDATION_LIMITS.MAX_VALUE;
    
    if (value > maxValue) {
        throw new Error(`${fieldName} value is too large. Maximum value is ${maxValue.toLocaleString()}`);
    }
    
    if (value < VALIDATION_LIMITS.MIN_VALUE) {
        throw new Error(`${fieldName} value is too small. Minimum value is ${VALIDATION_LIMITS.MIN_VALUE}`);
    }
    
    return true;
}

// LTL Class 결정 함수
function determineFreightClass(density) {
    for (const range of FREIGHT_CLASS_RANGES) {
        if (density >= range.minDensity) {
            return range.class;
        }
    }
    return 400; // 기본값 (가장 낮은 밀도)
}

function calculateFreightClass() {
    try {
        // 입력값 가져오기
        const length = parseFloat(document.getElementById('length').value);
        const width = parseFloat(document.getElementById('width').value);
        const height = parseFloat(document.getElementById('height').value);
        const weight = parseFloat(document.getElementById('weight').value);

        // 입력값 검증
        validateInput(length, 'Length', 'dimension');
        validateInput(width, 'Width', 'dimension');
        validateInput(height, 'Height', 'dimension');
        validateInput(weight, 'Weight', 'weight');

        // 부피 계산 (in³ → ft³ 변환)
        const volumeInFt3 = (length * width * height) / CUBIC_INCHES_PER_CUBIC_FOOT;
        const density = weight / volumeInFt3;

        // LTL Class 결정 (NMFC 기준)
        const freightClass = determineFreightClass(density);

        // 결과 출력
        document.getElementById('result').innerHTML = `
            <h3>📦 Result</h3>
            <p><strong>Freight Class</strong>: ${freightClass}</p>
            <p><strong>Density</strong>: ${density.toFixed(2)} lbs/ft³</p>
            <p><strong>Volume</strong>: ${volumeInFt3.toFixed(2)} ft³</p>
            <p class="history-notice">✅ Calculation saved to history</p>
        `;

        // 기록 업데이트
        updateHistoryList(length, width, height, weight, volumeInFt3, density, freightClass);
        saveHistoryToStorage();
    } catch (error) {
        document.getElementById('result').innerHTML = 
            `<p style="color: red;">⚠️ ${error.message}</p>`;
    }
}

function updateHistoryList(length, width, height, weight, volume, density, freightClass) {
    try {
        history.push({
            id: history.length + 1,
            dimensions: `${length}" x ${width}" x ${height}"`,
            weight: `${weight} lbs`,
            volume: volume.toFixed(2),
            density: density.toFixed(2),
            class: freightClass
        });

        renderHistoryTable();
    } catch (error) {
        console.error('Error updating history:', error);
    }
}

function renderHistoryTable() {
    try {
        const tbody = document.getElementById('historyBody');
        if (!tbody) throw new Error('History table body not found');
        
        tbody.innerHTML = '';

        history.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.dimensions}<br>${item.weight}</td>
                <td>${item.volume}</td>
                <td>${item.density}</td>
                <td>${item.class}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error rendering history table:', error);
    }
}

function resetHistory() {
    try {
        if (confirm("Clear all calculation history?")) {
            history = [];
            const tbody = document.getElementById('historyBody');
            if (tbody) tbody.innerHTML = '';
            saveHistoryToStorage(); // 로컬 스토리지도 초기화
        }
    } catch (error) {
        console.error('Error resetting history:', error);
    }
}

function copyHistory() {
    try {
        if (history.length === 0) {
            alert("No history to copy!");
            return;
        }

        let text = "Freight Class Calculation History\n\n";
        text += "No.\tDimensions\t\tWeight\tVolume\tDensity\tClass\n";
        text += "----------------------------------------------------------\n";
        
        history.forEach(item => {
            text += `${item.id}\t${item.dimensions}\t${item.weight}\t${item.volume}\t${item.density}\t${item.class}\n`;
        });

        navigator.clipboard.writeText(text)
            .then(() => alert("History copied as tab-separated text!"))
            .catch(err => {
                console.error("Copy failed:", err);
                alert("Failed to copy history. Please try again.");
            });
    } catch (error) {
        console.error('Error copying history:', error);
        alert("An error occurred while copying history.");
    }
}

// 페이지 로드 시 입력 필드 초기화 및 기록 불러오기
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.value = '';
    });
    
    // 저장된 기록 불러오기
    loadHistoryFromStorage();
});