'use client'

export default function FeedbackForm({ toolId }) {
  const handleFeedback = (fb) => {
    console.log(`Feedback for ${toolId}:`, fb)
  }

  return (
    <div className="flex gap-4 mt-2">
      <button onClick={() => handleFeedback('yes')} className="text-green-600">👍</button>
      <button onClick={() => handleFeedback('no')} className="text-red-600">👎</button>
    </div>
)
}
