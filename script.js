// 기록 저장 배열
let history = [];

// 입력값 검증 함수
function validateInput(value, fieldName) {
    if (isNaN(value) || value <= 0) {
        throw new Error(`Please enter a valid positive number for ${fieldName}`);
    }
    if (value > 10000) {
        throw new Error(`${fieldName} value is too large. Maximum value is 10,000`);
    }
    return true;
}

function calculateFreightClass() {
    try {
        // 입력값 가져오기
        const length = parseFloat(document.getElementById('length').value);
        const width = parseFloat(document.getElementById('width').value);
        const height = parseFloat(document.getElementById('height').value);
        const weight = parseFloat(document.getElementById('weight').value);

        // 입력값 검증
        validateInput(length, 'Length');
        validateInput(width, 'Width');
        validateInput(height, 'Height');
        validateInput(weight, 'Weight');

        // 부피 계산 (in³ → ft³ 변환)
        const volumeInFt3 = (length * width * height) / 1728;
        const density = weight / volumeInFt3;

        // LTL Class 결정 (NMFC 기준)
        let freightClass;
        if (density >= 50) freightClass = 50;
        else if (density >= 35) freightClass = 55;
        else if (density >= 30) freightClass = 60;
        else if (density >= 22.5) freightClass = 65;
        else if (density >= 15) freightClass = 70;
        else if (density >= 13.5) freightClass = 77.5;
        else if (density >= 12) freightClass = 85;
        else if (density >= 10.5) freightClass = 92.5;
        else if (density >= 9) freightClass = 100;
        else if (density >= 8) freightClass = 110;
        else if (density >= 7) freightClass = 125;
        else if (density >= 6) freightClass = 150;
        else if (density >= 5) freightClass = 175;
        else if (density >= 4) freightClass = 200;
        else if (density >= 3) freightClass = 250;
        else if (density >= 2) freightClass = 300;
        else freightClass = 400;

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

// 페이지 로드 시 입력 필드 초기화
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.value = '';
    });
});