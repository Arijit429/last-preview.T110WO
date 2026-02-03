function Profile() {
  const achievements = [
    { icon: '🎯', title: 'First Quiz', desc: 'Completed!', unlocked: true },
    { icon: '🔥', title: 'Week Streak', desc: '7 days!', unlocked: true },
    { icon: '🏆', title: 'High Scorer', desc: 'Score 90%+', unlocked: false },
    { icon: '📚', title: 'Bookworm', desc: '50 quizzes', unlocked: false }
  ]

  return (
    <div className="page">
      <div className="banner gradient-pink">
        <div className="banner-content profile-header">
          <div className="profile-avatar">👤</div>
          <div className="profile-info">
            <h1>Student Profile</h1>
            <p>Manage your account</p>
            <div className="profile-badges">
              <span className="badge">🎓 Learner</span>
              <span className="badge">⚡ Active</span>
              <span className="badge">🏆 Rising Star</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stat-card">
          <span className="profile-stat-icon">📚</span>
          <strong>12</strong>
          <span>Quizzes</span>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-icon">🔥</span>
          <strong>7</strong>
          <span>Day Streak</span>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-icon">🏆</span>
          <strong>78%</strong>
          <span>Avg Score</span>
        </div>
      </div>

      <div className="card">
        <h3>🏆 Achievements</h3>
        <div className="achievements-grid">
          {achievements.map((achievement, i) => (
            <div key={i} className={`achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
              <span>{achievement.icon}</span>
              <strong>{achievement.title}</strong>
              <small>{achievement.desc}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Profile
