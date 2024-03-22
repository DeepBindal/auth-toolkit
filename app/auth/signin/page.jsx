import SignInForm from '@/components/SignInForm'
import React from 'react'

const SignInPage = ({searchParams}) => {
  return (
    <SignInForm callbackUrl={searchParams.callbackUrl}/>
  )
}

export default SignInPage