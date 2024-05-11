import Component from 'react'
import Cookies from 'js-cookie'
import {BsSearch} from 'react-icons/bs'
import Loader from 'react-loader-spinner'

import Header from '../Header'
import ProfileDetails from '../ProfileDetails'
import JobCard from '../JobCard'
import FiltersGroup from '../FiltersGroup'

import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Jobs extends Component {
  state = {
    jobsApiStatus: apiStatusConstants.initial,
    profileApiStatus: apiStatusConstants.inProgress,
    jobsList: [],
    profileDetails: {},
    searchInput: '',
    activeSalaryRangeId: '',
    employmentTypesChecked: [],
  }

  componentDidMount() {
    this.getProfileDetails()
    this.getJobs()
  }

  updateEmploymentTypesChecked = typeId => {
    const {employmentTypesChecked} = this.state
    let updatedList = employmentTypesChecked
    if (employmentTypesChecked.includes(typeId)) {
      updatedList = employmentTypesChecked.filter(
        eachType => eachType !== typeId,
      )
    } else {
      updatedList = [...updatedList, typeId]
    }

    this.setState({employmentTypesChecked: updatedList}, this.getJobs)
  }

  updateSalaryRangeId = activeSalaryRangeId =>
    this.setState({activeSalaryRangeId}, this.getJobs)

  getProfileDetails = async () => {
    this.setState({jobsApiStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')

    const ProfileUrl = 'https://apis.ccbp.in/profile'
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(ProfileUrl, options)
    if (response.ok) {
      const data = await response.json()
      const fetchedProfileDetails = data.profile_details
      const updatedProfileDetails = {
        name: fetchedProfileDetails.name,
        profileImageUrl: fetchedProfileDetails.profile_image_url,
        shortBio: fetchedProfileDetails.short_bio,
      }
      this.setState({
        profileDetails: updatedProfileDetails,
        profileApiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({profileApiStatus: apiStatusConstants.failure})
    }
  }

  getJobs = async () => {
    this.setState({jobsApiStatus: apiStatusConstants.inProgress})

    const {
      searchInput,
      activeSalaryRangeId,
      employmentTypesChecked,
    } = this.state
    const employTypes = employmentTypesChecked.join(',')
    const jwtToken = Cookies.get('jwt_token')

    const apiUrl = `https://apis.ccbp.in/jobs?employment_type=${employTypes}&minimum_package=${activeSalaryRangeId}&search=${searchInput}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }

    const response = await fetch(apiUrl, options)
    const data = await response.json()
    if (response.ok === true) {
      const {jobs} = data
      const updatedData = jobs.map(eachJob => ({
        companyLogoUrl: eachJob.company_logo_url,
        employmentType: eachJob.employment_type,
        id: eachJob.id,
        jobDescription: eachJob.job_description,
        location: eachJob.location,
        packagePerAnnum: eachJob.package_per_annum,
        rating: eachJob.rating,
        title: eachJob.title,
      }))
      this.setState({
        jobsList: updatedData,
        jobsApiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({jobsApiStatus: apiStatusConstants.failure})
    }
  }

  renderSearchBar = searchBarID => {
    const {searchInput} = this.state
    return (
      <div className="search-bar" id={searchBarID}>
        <input
          className="search-input"
          type="text"
          value={searchInput}
          placeholder="Search"
          onChange={e => this.setState({searchInput: e.target.value})}
        />
        <button
          className="search-button"
          type="button"
          data-testid="searchButton"
          onClick={() => this.getJobs()}
          aria-label="Search Jobs" // Add aria-label for accessibility
        >
          <BsSearch className="search-icon" />
        </button>
      </div>
    )
  }

  renderSideBar = () => {
    const {
      profileDetails,
      profileApiStatus,
      activeSalaryRangeId,
      employmentTypesChecked,
    } = this.state
    return (
      <div className="side-bar">
        {this.renderSearchBar('smallSearchBar')}
        <ProfileDetails
          profileDetails={profileDetails}
          profileApiStatus={profileApiStatus}
          getProfileDetails={this.getProfileDetails}
        />
        <FiltersGroup
          updateSalaryRangeId={this.updateSalaryRangeId}
          activeSalaryRangeId={activeSalaryRangeId}
          updateEmploymentTypesChecked={this.updateEmploymentTypesChecked}
          employmentTypesChecked={employmentTypesChecked}
        />
      </div>
    )
  }

  renderNoJobsView = () => (
    <div className="no-jobs-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
        alt="no jobs"
        className="no-jobs-image"
      />
      <h1 className="no-jobs-heading">No Jobs Found</h1>
      <p className="no-jobs-description">
        We could not find any jobs. Try other filters.
      </p>
    </div>
  )

  renderJobsList = () => {
    const {jobsList} = this.state
    return (
      <>
        {jobsList.length > 0 ? (
          <ul className="jobsList">
            {jobsList.map(eachJob => (
              <JobCard key={eachJob.id} jobDetails={eachJob} />
            ))}
          </ul>
        ) : (
          this.renderNoJobsView()
        )}
      </>
    )
  }

  renderJobsLoaderView = () => (
    <div className="jobs-loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderJobsApiFailureView = () => (
    <div className="jobs-api-failure-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
        className="job-api-failure-image"
      />
      <h1 className="failure-view-heading">Oops! Something Went Wrong</h1>
      <p className="failure-view-description">
        We cannot seem to find the page you are looking for.
      </p>
      <button
        type="button"
        className="retry-button"
        onClick={() => this.getJobs()}
      >
        Retry
      </button>
    </div>
  )

  renderJobsBasedOnApiStatus = () => {
    const {jobsApiStatus} = this.state

    switch (jobsApiStatus) {
      case apiStatusConstants.inProgress:
        return this.renderJobsLoaderView()
      case apiStatusConstants.failure:
        return this.renderJobsApiFailureView()
      case apiStatusConstants.success:
        return this.renderJobsList()
      default:
        return null
    }
  }

  render() {
    return (
      <div className="jobs-page-container">
        <Header />
        <div className="jobs-page">
          {this.renderSideBar()}
          <div className="jobs-container">
            {this.renderSearchBar('largeSearchBar')}
            {this.renderJobsBasedOnAPiStatus()}
          </div>
        </div>
      </div>
    )
  }
}

export default Jobs
