import { useState } from 'react'

interface Quiz {
  id: number
  title: string
  subject: string
  difficulty: string
  time: number
}

function Quizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    { id: 1, title: 'Algebra Basics', subject: 'Mathematics', difficulty: 'Easy', time: 15 },
    { id: 2, title: 'World War II', subject: 'History', difficulty: 'Medium', time: 20 },
    { id: 3, title: 'Photosynthesis', subject: 'Science', difficulty: 'Medium', time: 18 }
  ])

  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    topic: '',
    subject: '',
    difficulty: 'Medium',
    count: 5
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newQuiz: Quiz = {
      id: Date.now(),
      title: formData.topic,
      subject: formData.subject,
      difficulty: formData.difficulty,
      time: formData.count * 2
    }
    setQuizzes([newQuiz, ...quizzes])
    setShowModal(false)
    setFormData({ topic: '', subject: '', difficulty: 'Medium', count: 5 })
  }

  const easyCount = quizzes.filter(q => q.difficulty === 'Easy').length
  const mediumCount = quizzes.filter(q => q.difficulty === 'Medium').length
  const hardCount = quizzes.filter(q => q.difficulty === 'Hard').length

  return (
    <div className="page">
      <div className="banner gradient-green">
        <div className="banner-content">
          <span className="banner-tag">🧠 AI-Powered</span>
          <h1>Quiz Library</h1>
          <p>Generate custom quizzes on any topic.</p>
          <button className="btn btn-white" onClick={() => setShowModal(true)}>
            ✨ Generate Quiz
          </button>
        </div>
      </div>

      <div className="quiz-stats">
        <span className="quiz-stat">📚 <strong>{quizzes.length}</strong> Total</span>
        <span className="quiz-stat">🟢 <strong>{easyCount}</strong> Easy</span>
        <span className="quiz-stat">🟡 <strong>{mediumCount}</strong> Medium</span>
        <span className="quiz-stat">🔴 <strong>{hardCount}</strong> Hard</span>
      </div>

      <div className="quiz-grid">
        {quizzes.map(quiz => (
          <div key={quiz.id} className="quiz-card">
            <h4>{quiz.title}</h4>
            <p className="subject">{quiz.subject}</p>
            <div className="quiz-meta">
              <span className={`badge badge-${quiz.difficulty.toLowerCase()}`}>
                {quiz.difficulty}
              </span>
              <span className="quiz-info">⏱️ {quiz.time} min</span>
            </div>
            <button className="btn btn-primary btn-full">▶️ Start Quiz</button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal active" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✨ Generate Quiz</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <label>Topic</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Photosynthesis"
                required
              />
              <label>Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Biology"
                required
              />
              <div className="form-row">
                <div className="form-group">
                  <label>Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <option value="Easy">🟢 Easy</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Hard">🔴 Hard</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Questions</label>
                  <input
                    type="number"
                    value={formData.count}
                    onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
                    min="3"
                    max="20"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full">⚡ Generate</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Quizzes
