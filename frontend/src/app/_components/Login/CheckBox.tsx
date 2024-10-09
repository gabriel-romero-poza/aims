import React from 'react'

export const CheckBox = ({text} : {text:string}) => {
    return(
      <div className='flex items-center'>
          <input
            type="checkbox"
            className="w-4 h-4 text-gray-300 border-gray-600 rounded focus:ring-gray-500"
          />
        <span className="ml-2 text-sm text-gray-300">
          {text}
        </span>
      </div>
    )
}     