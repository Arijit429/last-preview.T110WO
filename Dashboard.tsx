interface DashboardProps {
  setCurrentPage: (page: string) => void
}

function Dashboard({ setCurrentPage }: DashboardProps) {
  return (
    <div className="page">
      <div className="banner gradient-blue">
        <div className="banner-content">
          <span className="banner-tag">🚀 Welcome Back!</span>
          <h1>Your Learning Dashboard</h1>
          <p>Track your progress and achieve your study goals.</p>
          <div className="banner-actions">
            <button className="btn btn-white" onClick={() => setCurrentPage('quizzes')}>
              ✨ Create Quiz
            </button>
            <button className="btn btn-glass" onClick={() => setCurrentPage('analytics')}>
              📈 View Stats
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📚</span>
          <span className="stat-value">12</span>
          <span className="stat-label">Quizzes</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🎯</span>
          <span className="stat-value">78%</span>
          <span className="stat-label">Avg Score</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔥</span>
          <span className="stat-value">7</span>
          <span className="stat-label">Day Streak</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⭐</span>
          <span className="stat-value">5</span>
          <span className="stat-label">This Week</span>
        </div>
      </div>

      <div className="two-column">
        <div className="card">
          <div className="card-header">
            <h3>🚀 Recent Quizzes</h3>
            <button className="btn btn-small" onClick={() => setCurrentPage('quizzes')}>
              + New
            </button>
          </div>
          <div className="card-content">
            <div className="quiz-item">
              <h4>Algebra Basics</h4>
              <p>Mathematics</p>
              <span className="badge badge-easy">Easy</span>
            </div>
            <div className="quiz-item">
              <h4>World War II</h4>
              <p>History</p>
              <span className="badge badge-medium">Medium</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>📅 Upcoming Events</h3>
            <button className="btn btn-small" onClick={() => setCurrentPage('calendar')}>
              + Add
            </button>
          </div>
          <div className="card-content">
            <div className="event-item">
              <span className="event-icon">🎯</span>
              <div>
                <h4>Math Exam</h4>
                <p>In 3 days</p>
              </div>
            </div>
            <div className="event-item">
              <span className="event-icon">📚</span>
              <div>
                <h4>Study Session</h4>
                <p>Tomorrow</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
