window.addEventListener('load', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    loadResults();
});

function loadResults() {
    const resultsData = JSON.parse(sessionStorage.getItem('examResults') || '{}');
    const testData = JSON.parse(sessionStorage.getItem('testData') || '{}');
    
    
    if (!resultsData.score) {
        alert('No exam results found. Please take the exam first.');
        window.location.href = 'test-entry.html';
        return;
    }
    
    document.getElementById('studentName').textContent = testData.studentName || 'Student';
    document.getElementById('testId').textContent = testData.testId || 'TEST-ID';
    
    displayScore(resultsData);
    
    displayQuickStats(resultsData);
    
    displaySectionPerformance(resultsData);
    
    displayQuestions(resultsData);
    
    setupEventListeners();
}

function displayScore(results) {
    const scoreValue = results.score || 0;
    document.getElementById('scoreValue').textContent = scoreValue;
    
    const circumference = 2 * Math.PI * 85;
    const offset = circumference - (scoreValue / 100) * circumference;
    const scoreCircle = document.getElementById('scoreCircle');
    
    setTimeout(() => {
        scoreCircle.style.strokeDashoffset = offset;
        
        if (scoreValue >= 90) {
            scoreCircle.style.stroke = '#6ec89b'; // Green
        } else if (scoreValue >= 75) {
            scoreCircle.style.stroke = '#5ba3d0'; // Blue
        } else if (scoreValue >= 60) {
            scoreCircle.style.stroke = '#ffbd2e'; // Yellow
        } else {
            scoreCircle.style.stroke = '#ff5f56'; // Red
        }
    }, 500);
    
    let status, message;
    if (scoreValue >= 90) {
        status = 'Excellent! 🎉';
        message = 'Outstanding performance! You\'ve mastered the material.';
    } else if (scoreValue >= 75) {
        status = 'Great Job! 👏';
        message = 'You did very well! Keep up the good work.';
    } else if (scoreValue >= 60) {
        status = 'Good Effort! 💪';
        message = 'You\'re on the right track. A bit more practice will help.';
    } else if (scoreValue >= 40) {
        status = 'Keep Trying! 📚';
        message = 'Don\'t give up! Review the material and try again.';
    } else {
        status = 'Need Improvement 📖';
        message = 'More study is needed. Focus on understanding the concepts.';
    }
    
    document.getElementById('resultStatus').textContent = status;
    document.getElementById('resultMessage').textContent = message;
    
    const totalQuestions = results.totalQuestions || 50;
    const correctAnswers = results.correctAnswers || 0;
    document.getElementById('totalScore').textContent = `${correctAnswers}/${totalQuestions}`;
    
    const timeTaken = results.timeTaken || 0;
    const hours = Math.floor(timeTaken / 3600);
    const minutes = Math.floor((timeTaken % 3600) / 60);
    const seconds = timeTaken % 60;
    document.getElementById('timeTaken').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    const submissionDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('submissionDate').textContent = submissionDate;
}

function displayQuickStats(results) {
    const correctAnswers = results.correctAnswers || 0;
    const wrongAnswers = results.wrongAnswers || 0;
    const unanswered = results.unanswered || 0;
    const totalAttempted = correctAnswers + wrongAnswers;
    const accuracyRate = totalAttempted > 0 ? Math.round((correctAnswers / totalAttempted) * 100) : 0;
    
    document.getElementById('correctCount').textContent = correctAnswers;
    document.getElementById('wrongCount').textContent = wrongAnswers;
    document.getElementById('unansweredCount').textContent = unanswered;
    document.getElementById('accuracyRate').textContent = accuracyRate + '%';
}

function displaySectionPerformance(results) {
    const section1Correct = results.section1Correct || 0;
    const section1Total = results.section1Total || 30;
    const section1Wrong = results.section1Wrong || 0;
    const section1Unanswered = section1Total - section1Correct - section1Wrong;
    const section1Percentage = Math.round((section1Correct / section1Total) * 100);
    
    document.getElementById('section1Score').textContent = `${section1Correct}/${section1Total}`;
    document.getElementById('section1Percentage').textContent = section1Percentage + '%';
    document.getElementById('section1Correct').textContent = section1Correct;
    document.getElementById('section1Wrong').textContent = section1Wrong;
    document.getElementById('section1Unanswered').textContent = section1Unanswered;
    
    setTimeout(() => {
        document.getElementById('section1Fill').style.width = section1Percentage + '%';
    }, 800);
    
    const section2Answered = results.section2Answered || 0;
    const section2Total = results.section2Total || 20;
    const section2Unanswered = section2Total - section2Answered;
    const section2Percentage = Math.round((section2Answered / section2Total) * 100);
    
    document.getElementById('section2Score').textContent = `${section2Answered}/${section2Total}`;
    document.getElementById('section2Percentage').textContent = section2Percentage + '%';
    document.getElementById('section2Answered').textContent = section2Answered;
    document.getElementById('section2Unanswered').textContent = section2Unanswered;
    
    setTimeout(() => {
        document.getElementById('section2Fill').style.width = section2Percentage + '%';
    }, 1000);
}

function displayQuestions(results) {
    const questionsList = document.getElementById('questionsList');
    const questions = results.questions || {};
    const answers = results.answers || {};
    
    const allQuestions = [
        ...(questions.section1 || []),
        ...(questions.section2 || [])
    ];
    
    questionsList.innerHTML = allQuestions.map(q => {
        const userAnswer = answers[q.id];
        let status, statusText, statusClass;
        
        if (q.type === 'descriptive') {
            if (userAnswer && userAnswer.trim().length > 50) {
                status = 'correct';
                statusText = 'Answered';
                statusClass = 'correct';
            } else if (userAnswer && userAnswer.trim().length > 0) {
                status = 'wrong';
                statusText = 'Partial Answer';
                statusClass = 'wrong';
            } else {
                status = 'unanswered';
                statusText = 'Not Answered';
                statusClass = 'unanswered';
            }
            
            return `
                <div class="question-item ${statusClass}" data-status="${status}">
                    <div class="question-header">
                        <span class="question-number">Question ${q.id}</span>
                        <span class="question-status ${statusClass}">
                            <i data-lucide="${status === 'correct' ? 'check-circle' : status === 'wrong' ? 'alert-circle' : 'minus-circle'}"></i>
                            ${statusText}
                        </span>
                    </div>
                    <div class="question-text">${q.question}</div>
                    <div class="answer-info">
                        <strong>Your Answer:</strong><br>
                        ${userAnswer ? userAnswer : '<em>No answer provided</em>'}
                    </div>
                </div>
            `;
        } else {
            const isCorrect = userAnswer === q.correctAnswer;
            const isAnswered = userAnswer !== undefined;
            
            if (isAnswered && isCorrect) {
                status = 'correct';
                statusText = 'Correct';
                statusClass = 'correct';
            } else if (isAnswered && !isCorrect) {
                status = 'wrong';
                statusText = 'Wrong';
                statusClass = 'wrong';
            } else {
                status = 'unanswered';
                statusText = 'Not Answered';
                statusClass = 'unanswered';
            }
            
            const optionsHTML = q.options.map((option, index) => {
                let optionClass = '';
                if (index === q.correctAnswer) {
                    optionClass = 'correct-answer';
                }
                if (userAnswer === index && userAnswer !== q.correctAnswer) {
                    optionClass = 'wrong-answer';
                }
                if (userAnswer === index) {
                    optionClass += ' user-answer';
                }
                
                return `
                    <div class="option-item ${optionClass}">
                        <div class="option-label">${String.fromCharCode(65 + index)}</div>
                        <div class="option-text">${option}</div>
                    </div>
                `;
            }).join('');
            
            return `
                <div class="question-item ${statusClass}" data-status="${status}">
                    <div class="question-header">
                        <span class="question-number">Question ${q.id}</span>
                        <span class="question-status ${statusClass}">
                            <i data-lucide="${status === 'correct' ? 'check-circle' : status === 'wrong' ? 'x-circle' : 'minus-circle'}"></i>
                            ${statusText}
                        </span>
                    </div>
                    <div class="question-text">${q.question}</div>
                    <div class="question-options">
                        ${optionsHTML}
                    </div>
                    ${isAnswered ? `
                        <div class="answer-info">
                            <strong>Your Answer:</strong> ${String.fromCharCode(65 + userAnswer)}<br>
                            <strong>Correct Answer:</strong> ${String.fromCharCode(65 + q.correctAnswer)}
                        </div>
                    ` : `
                        <div class="answer-info">
                            <strong>Correct Answer:</strong> ${String.fromCharCode(65 + q.correctAnswer)}
                        </div>
                    `}
                </div>
            `;
        }
    }).join('');
    
    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 100);
}

function setupEventListeners() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            filterQuestions(filter);
        });
    });
    
    document.getElementById('downloadBtn').addEventListener('click', downloadReport);
    
    document.getElementById('retakeBtn').addEventListener('click', retakeExam);
}

function filterQuestions(filter) {
    const questions = document.querySelectorAll('.question-item');
    
    questions.forEach(q => {
        if (filter === 'all') {
            q.classList.remove('hidden');
        } else {
            if (q.dataset.status === filter) {
                q.classList.remove('hidden');
            } else {
                q.classList.add('hidden');
            }
        }
    });
}

function downloadReport() {
    const resultsData = JSON.parse(sessionStorage.getItem('examResults') || '{}');
    const testData = JSON.parse(sessionStorage.getItem('testData') || '{}');
    
    const reportContent = `
╔══════════════════════════════════════════════════════════════════╗
║                    EXAM REPORT - PLATTINUM.NET                   ║
╚══════════════════════════════════════════════════════════════════╝

STUDENT INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:           ${testData.studentName || 'N/A'}
Test ID:        ${testData.testId || 'N/A'}
Email:          ${testData.email || 'N/A'}
Date:           ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Time:           ${new Date().toLocaleTimeString('en-US')}

OVERALL PERFORMANCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Score:          ${resultsData.score || 0}%
Total Score:    ${resultsData.correctAnswers || 0}/${resultsData.totalQuestions || 50}
Time Taken:     ${formatTime(resultsData.timeTaken || 0)}

SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Correct:      ${resultsData.correctAnswers || 0}
✗ Wrong:        ${resultsData.wrongAnswers || 0}
- Unanswered:   ${resultsData.unanswered || 0}
Accuracy:       ${calculateAccuracy(resultsData)}%

SECTION-WISE PERFORMANCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Section 1 (MCQ):
  Score:        ${resultsData.section1Correct || 0}/${resultsData.section1Total || 30}
  Percentage:   ${Math.round(((resultsData.section1Correct || 0) / (resultsData.section1Total || 30)) * 100)}%
  Correct:      ${resultsData.section1Correct || 0}
  Wrong:        ${resultsData.section1Wrong || 0}
  Unanswered:   ${(resultsData.section1Total || 30) - (resultsData.section1Correct || 0) - (resultsData.section1Wrong || 0)}

Section 2 (Descriptive):
  Score:        ${resultsData.section2Answered || 0}/${resultsData.section2Total || 20}
  Percentage:   ${Math.round(((resultsData.section2Answered || 0) / (resultsData.section2Total || 20)) * 100)}%
  Answered:     ${resultsData.section2Answered || 0}
  Unanswered:   ${(resultsData.section2Total || 20) - (resultsData.section2Answered || 0)}

PERFORMANCE ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getPerformanceAnalysis(resultsData.score || 0)}

RECOMMENDATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getRecommendations(resultsData)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Report Generated: ${new Date().toLocaleString()}
Powered by Plattinum.net - Online Exam Platform
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
    
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Exam_Report_${testData.testId || 'RESULT'}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Report downloaded successfully!');
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function calculateAccuracy(results) {
    const correct = results.correctAnswers || 0;
    const wrong = results.wrongAnswers || 0;
    const attempted = correct + wrong;
    return attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
}

function getPerformanceAnalysis(score) {
    if (score >= 90) {
        return 'Excellent! You have demonstrated outstanding understanding of the material.\nYour performance is in the top tier.';
    } else if (score >= 75) {
        return 'Great job! You have a strong grasp of the concepts.\nWith a bit more practice, you can achieve excellence.';
    } else if (score >= 60) {
        return 'Good effort! You have a decent understanding of the material.\nFocus on areas where you struggled to improve further.';
    } else if (score >= 40) {
        return 'You need more practice. Review the material thoroughly.\nIdentify weak areas and work on strengthening them.';
    } else {
        return 'Significant improvement needed. Consider revisiting the fundamentals.\nSeek additional help or resources to better understand the concepts.';
    }
}

function getRecommendations(results) {
    const recommendations = [];
    
    if ((results.wrongAnswers || 0) > 5) {
        recommendations.push('• Review questions you got wrong and understand why');
    }
    
    if ((results.unanswered || 0) > 5) {
        recommendations.push('• Work on time management to attempt all questions');
    }
    
    const section1Percentage = Math.round(((results.section1Correct || 0) / (results.section1Total || 30)) * 100);
    if (section1Percentage < 70) {
        recommendations.push('• Focus more on multiple choice question strategies');
    }
    
    const section2Percentage = Math.round(((results.section2Answered || 0) / (results.section2Total || 20)) * 100);
    if (section2Percentage < 70) {
        recommendations.push('• Practice writing detailed descriptive answers');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('• Keep up the excellent work!');
        recommendations.push('• Continue practicing to maintain your performance');
    }
    
    return recommendations.join('\n');
}

function retakeExam() {
    if (confirm('Are you sure you want to retake the exam? Your current results will be lost.')) {
        sessionStorage.removeItem('examResults');
        
        window.location.href = 'exam.html';
    }
}

