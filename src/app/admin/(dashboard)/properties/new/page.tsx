import PropertyForm from '../PropertyForm'

export default function NewPropertyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Add New Property</h1>
        <p className="text-gray-500 mt-1">Create a new property listing</p>
      </div>

      <PropertyForm />
    </div>
  )
}
