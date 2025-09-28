import React from 'react'

const MainPage = () => {
  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Main Content */}
      <div className="pt-[100px] px-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Главный</h1>
            <p className="text-gray-600">Здесь будет функционал вашего банка</p>
          </div>
          <div className="text-sm text-gray-500">
            Функционал в разработке
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainPage