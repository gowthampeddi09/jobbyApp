import Loader from 'react-loader-spinner'

import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

const ProfileDetails = props => {
  const {profileDetails, profileApiStatus, getProfileDetails} = props

  const renderProfile = () => {
    const {name, profileImageUrl, shortBio} = profileDetails
    return (
      <div className="profile-details-container">
        <img src={profileImageUrl} alt="profile" className="profile-image" />
        <h1 className="profile-name">{name}</h1>
        <p className="profile-bio">{shortBio}</p>
      </div>
    )
  }

  const renderProfileFailureView = () => (
    <div className="profile-failure-container">
      <button
        className="retry-button"
        type="button"
        onClick={getProfileDetails}
      >
        Retry
      </button>
    </div>
  )

  const renderProfileLoader = () => (
    <div className="loader-container-profile" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height={50} width={50} />
    </div>
  )

  switch (profileApiStatus) {
    case apiStatusConstants.inProgress:
      return renderProfileLoader()
    case apiStatusConstants.failure:
      return renderProfileFailureView()
    case apiStatusConstants.success:
      return renderProfile()
    default:
      return null
  }
}

export default ProfileDetails
