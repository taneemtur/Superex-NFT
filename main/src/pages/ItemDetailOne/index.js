import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axiosconfig from '../../axiosConfig'
import Countdown from 'react-countdown'
import { client01, client02, client03, client08, client09, client10, item1, item2, gif1, gif2, itemDetail1 } from '../../components/imageImport'
import Main from '../../Layouts/Main'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import NFTListModel from '../../components/NFTListModel'
import { splitWalletAddress } from '../../utils'
import { getChainByName } from '../../blockchain/supportedChains'
import { approveUSDT, buyNFT, listingCancel } from '../../blockchain/mintContracts'
import { USER_ACTIVITIES } from '../../activities'


const ItemDetailOne = () => {
  const navigate = useNavigate();
  const { account } = useSelector(state => state.theme)
  const { nftAddress } = useParams();
  const [nft, setNft] = useState(null);
  const [showListModal, setShowListModal] = useState(false);

  const getNftData = async () => {
    await axiosconfig.get(`/nfts/${nftAddress}`).then((res) => {
      setNft(res.data.data)
    })
  }

  async function cancel() {
    const id = toast.loading('Cancel Listing...');
    try {
      await listingCancel(parseInt(nft?.fixedListingId), nft?.blockchain, account);
      const res = await axiosconfig.put(`/nfts/unlistnft`, { nftAddress })
      await axiosconfig.post("/activity/useractivity", {
        // userId, activityName, activityData
        userId: account,
        activityName: USER_ACTIVITIES.CANCEL_LISTING,
        activityData: {
          ...res.data.data,
          unlistedAt: new Date()
        }
      })
      toast.update(id, { render: `${res.data.message}`, closeOnClick: true, type: 'success', isLoading: false, closeButton: true, autoClose: 5000 })
    } catch (error) {
      toast.update(id, { render: `${error.message}`, closeOnClick: true, type: 'error', isLoading: false, closeButton: true, autoClose: 5000 })
    }
    getNftData()
  }

  async function buy() {
    const id = toast.loading('Buying NFT...');
    try {
      nft?.paymentToken == 'USDT' ? await approveUSDT(account, nft?.blockchain, nft?.price) : '';
      await buyNFT(nft?.fixedListingId, nft?.price, nft?.blockchain, account)
      const res = await axiosconfig.put(`/nfts/updatenftowner`, { nftAddress, owner: account });
      await axiosconfig.post("/activity/useractivity", {
        // userId, activityName, activityData
        userId: account,
        activityName: USER_ACTIVITIES.BUY_NFT,
        activityData: {
          ...res.data.data,
          buyAt: new Date()
        }
      })
      await axiosconfig.post("/activity/useractivity", {
        // userId, activityName, activityData
        userId: nft?.owner.walletAddress,
        activityName: USER_ACTIVITIES.SELL_NFT,
        activityData: {
          ...res.data.data,
          sellAt: new Date()
        }
      })
      await axiosconfig.put(`/nfts/unlistnft`, { nftAddress });
      toast.update(id, { render: `NFT Bought`, closeOnClick: true, type: 'success', isLoading: false, closeButton: true, autoClose: 5000 })
    } catch (error) {
      toast.update(id, { render: `${error.message}`, closeOnClick: true, type: 'error', isLoading: false, closeButton: true, autoClose: 5000 })
    }
    getNftData()
  }

  useEffect(() => {
    if (nftAddress) {
      getNftData()
    }
    return () => {
      setNft(null)
    }
  }, [nftAddress])

  const activityData = [
    {
      title: 'Digital Art Collection',
      author: 'Panda',
      time: '1 hours ago',
      favorite: 'Started Following',
      image: item1,
    },
    {
      title: 'Skrrt Cobain Official',
      author: 'ButterFly',
      time: '2 hours ago',
      favorite: 'Liked by',
      image: gif1,
    },
    {
      title: 'Wow! That Brain Is Floating',
      author: 'ButterFly',
      time: '2 hours ago',
      favorite: 'Liked by',
      image: item2,
    },
  ]

  return (
    <Main>
      {/* Start */}
      <section className="bg-item-detail d-table w-100">
        <div className="container">
          <div className="row">
            {
              nft?.owner?.walletAddress == account && (
                <div className='col-md-12 d-flex justify-content-end'>
                  <a
                    href="/"
                    onClick={e => {
                      e.preventDefault()
                      navigate('/create-nft', {
                        state: { nft: nft }
                      })
                    }}
                    className="btn btn-pills btn-outline-primary mx-1"
                  >
                    Edit Item
                  </a>
                  {
                    nft?.listed == false && (
                      <a
                        data-bs-toggle="modal"
                        data-bs-target="#ListNFT"
                        className="btn btn-pills btn-outline-primary mx-1"
                      >
                        List Item
                      </a>
                    )
                  }
                  {
                    nft?.listed == true && (
                      <a
                        onClick={cancel}
                        className="btn btn-pills btn-outline-primary mx-1"
                      >
                        Cancel Listing
                      </a>
                    )
                  }
                  <a
                    onClick={async (e) => {
                      e.preventDefault()
                      const id = toast.loading('NFT Deleteing');
                      // navigate('/upload-work')
                      await axiosconfig.delete(`/nfts/${nft.nftAddress}`)
                        .then(async (res) => {
                          await axiosconfig.post("/activity/useractivity", {
                            // userId, activityName, activityData
                            userId: account,
                            activityName: USER_ACTIVITIES.DELETE_NFT,
                            activityData: {
                              ...res.data.data,
                              deleteAt: new Date()
                            }
                          })
                          toast.update(id, {
                            render: `${res.data.message}`, closeOnClick: true, type: 'success', isLoading: false, closeButton: true, onClick: () => navigate(`/creator-profile`)
                          })
                          navigate(`/creator-profile`)
                        }).catch(err => {
                          console.log(err)
                        })
                    }}
                    className="btn btn-pills btn-icon btn-outline-primary mx-1"
                  >
                    <i className="uil uil-trash"></i>
                  </a>
                </div>
              )
            }
            <div className="col-md-6">
              <div className="sticky-bar">
                <img
                  src={nft?.image || itemDetail1}
                  className="img-fluid rounded-md shadow"
                  alt={nft?.walletAddress}
                />
              </div>
            </div>

            <div className="col-md-6 mt-4 pt-2 mt-sm-0 pt-sm-0">
              <div className="ms-lg-5">
                <Link to={`/collection/${nft
                  ?.collection?.collectionAddress}`}>
                  <p>{nft?.collection.name}</p>
                </Link>
                <div className="title-heading">
                  <h4 className="h3 fw-bold mb-0">
                    {nft?.name}
                  </h4>
                </div>

                <div className="row">
                  <div className="col-md-6 mt-4 pt-2">
                    <h6>Price</h6>
                    <h4 className="mb-0"> {nft?.price} {nft?.paymentToken == 'USDT' ? nft?.paymentToken : getChainByName(nft?.blockchain)} </h4>
                  </div>

                  {
                    nft?.listed && nft?.owner?.walletAddress != account && (
                      <div className="col-12 mt-4 pt-2">
                        <a
                          href=""
                          className="btn btn-l btn-pills btn-primary"
                          onClick={(e) => {
                            e.preventDefault();
                            buy();
                          }}
                        >
                          <i className="mdi mdi-cart fs-5 me-2"></i> Buy Now
                        </a>
                      </div>
                    )
                  }
                </div>
                <div className="row mt-4 pt-2">
                  <div className="col-12">
                    <ul
                      className="nav nav-tabs border-bottom"
                      id="myTab"
                      role="tablist"
                    >
                      <li className="nav-item" role="presentation">
                        <button
                          className="nav-link active"
                          id="detail-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#detailItem"
                          type="button"
                          role="tab"
                          aria-controls="detailItem"
                          aria-selected="true"
                        >
                          Details
                        </button>
                      </li>

                      <li className="nav-item" role="presentation">
                        <button
                          className="nav-link"
                          id="activity-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#activity"
                          type="button"
                          role="tab"
                          aria-controls="activity"
                          aria-selected="false"
                        >
                          Activity
                        </button>
                      </li>
                    </ul>

                    <div className="tab-content mt-4 pt-2" id="myTabContent">
                      <div
                        className="tab-pane fade show active"
                        id="detailItem"
                        role="tabpanel"
                        aria-labelledby="detail-tab"
                      >
                        <p className="text-muted">
                          {nft?.description}
                        </p>
                        <h6>Owner</h6>

                        <div className="creators creator-primary d-flex align-items-center">
                          <div className="position-relative">
                            <img
                              src={nft?.owner?.profileImage || client09}
                              className="avatar avatar-md-sm shadow-md rounded-pill"
                              alt={nft?.owner?.name}
                            />
                            <span className="verified text-primary">
                              <i className="mdi mdi-check-decagram"></i>
                            </span>
                          </div>

                          <div className="ms-3">
                            <h6 className="mb-0">
                              {
                                nft && (
                                  <a
                                    href="/creators"
                                    onClick={e => {
                                      e.preventDefault()
                                      navigate('/creators')
                                    }}
                                    className="text-dark name"
                                  >
                                    {splitWalletAddress(nft?.owner?.walletAddress)} - {nft?.owner?.name && nft?.owner?.name}
                                  </a>
                                )
                              }
                            </h6>
                          </div>
                        </div>
                      </div>

                      <div
                        className="tab-pane fade"
                        id="activity"
                        role="tabpanel"
                        aria-labelledby="activity-tab"
                      >
                        <div className="row g-4">
                          {activityData?.map(data => {
                            return (
                              <div className="col-12" key={data?.title}>
                                <div className="card activity activity-primary rounded-md shadow p-4">
                                  <div className="d-flex align-items-center">
                                    <div className="position-relative">
                                      <img
                                        src={data?.image}
                                        className="avatar avatar-md-md rounded-md shadow-md"
                                        alt=""
                                      />

                                      <div className="position-absolute top-0 start-0 translate-middle px-1 rounded-lg shadow-md bg-white">
                                        {data?.favorite ===
                                          'Started Following' ? (
                                          <i className="mdi mdi-account-check mdi-18px text-success"></i>
                                        ) : data?.favorite === 'Liked by' ? (
                                          <i className="mdi mdi-heart mdi-18px text-danger"></i>
                                        ) : (
                                          <i className="mdi mdi-format-list-bulleted mdi-18px text-warning"></i>
                                        )}
                                      </div>
                                    </div>
                                    <span className="content ms-3">
                                      <a
                                        href=""
                                        onClick={e => e.preventDefault()}
                                        className="text-dark title mb-0 h6 d-block"
                                      >
                                        {data?.time}
                                      </a>
                                      <small className="text-muted d-block mt-1">
                                        {data?.favorite}{' '}
                                        <a
                                          href=""
                                          onClick={e => e.preventDefault()}
                                          className="link fw-bold"
                                        >
                                          @{data?.author}
                                        </a>
                                      </small>

                                      <small className="text-muted d-block mt-1">
                                        {data?.time}
                                      </small>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                          {/*end col*/}
                        </div>
                        {/*end row*/}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
            {/*end col*/}
          </div>
          {/*end row*/}
        </div>
        {/*end container*/}

        {/*end container*/}
      </section>
      {/*end section*/}
      {/* End */}

      <NFTListModel prevPrice={nft?.price} nft={nft} id="ListNFT" labelledby="NFTList" nftAddress={nftAddress} setNFT={setNft} />


      {/* Place Bid Modal */}
      <div
        className="modal fade"
        id="NftBid"
        aria-hidden="true"
        aria-labelledby="bidtitle"
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content border-0 shadow-md rounded-md">
            <div className="modal-header">
              <h5 className="modal-title" id="bidtitle">
                Place a Bid
              </h5>
              <button
                type="button"
                className="btn btn-close"
                data-bs-dismiss="modal"
                id="close-modal"
              >
                <i className="uil uil-times fs-4"></i>
              </button>
            </div>
            <div className="modal-body p-4">
              <form>
                <div className="row">
                  <div className="col-12">
                    <div className="mb-4">
                      <label className="form-label fw-bold">
                        Your Bid Price <span className="text-danger">*</span>
                      </label>
                      <input
                        name="name"
                        id="name"
                        type="text"
                        className="form-control"
                        placeholder="00.00 ETH"
                      />
                      <small className="text-muted">
                        <span className="text-dark">Note:</span> Bid price at
                        least 1 ETH
                      </small>
                    </div>
                  </div>
                  {/*end col*/}
                  <div className="col-12">
                    <div className="mb-4">
                      <label className="form-label fw-bold">
                        Enter Your QTY <span className="text-danger">*</span>
                      </label>
                      <input
                        name="email"
                        id="email"
                        type="email"
                        className="form-control"
                        placeholder="0"
                      />
                      <small className="text-muted">
                        <span className="text-dark">Note:</span> Max. Qty 5
                      </small>
                    </div>
                  </div>
                  {/*end col*/}
                </div>
              </form>

              <div className="pt-3 border-top">
                <div className="d-flex justify-content-between">
                  <p className="fw-bold small"> You must bid at least:</p>
                  <p className="text-primary"> 1.22 ETH </p>
                </div>
                <div className="d-flex justify-content-between">
                  <p className="fw-bold small"> Service free:</p>
                  <p className="text-primary"> 0.05 ETH </p>
                </div>
                <div className="d-flex justify-content-between">
                  <p className="fw-bold small"> Total bid amount:</p>
                  <p className="text-primary mb-0"> 1.27 ETH </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-pills btn-primary"
                data-bs-target="#placebid"
                data-bs-toggle="modal"
              >
                <i className="mdi mdi-gavel fs-5 me-2"></i> Place a Bid
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="placebid"
        aria-hidden="true"
        aria-labelledby="bidsuccess"
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content border-0 shadow-md rounded-md">
            <div className="modal-header">
              <h5 className="modal-title" id="bidsuccess">
                Bidding Successful
              </h5>
              <button
                type="button"
                className="btn btn-close"
                data-bs-dismiss="modal"
                id="close-modal"
              >
                <i className="uil uil-times fs-4"></i>
              </button>
            </div>
            <div className="modal-body p-4">
              your bid (1.27ETH) has been listing to our database
            </div>
            <div className="modal-footer">
              <a
                href="/activity"
                onClick={e => {
                  e.preventDefault()
                  navigate('/activity')
                }}
                data-bs-toggle="modal"
                className="btn btn-pills btn-primary"
              >
                <i className="mdi mdi-basket-plus fs-5 me-2"></i> View Your Bid
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Place Bid Modal */}

      {/* Buy Now NFt Modal */}
      <div
        className="modal fade"
        id="NftBuynow"
        aria-hidden="true"
        aria-labelledby="buyNft"
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content border-0 shadow-md rounded-md">
            <div className="modal-header">
              <h5 className="modal-title" id="buyNft">
                Checkout
              </h5>
              <button
                type="button"
                className="btn btn-close"
                data-bs-dismiss="modal"
                id="close-modal"
              >
                <i className="uil uil-times fs-4"></i>
              </button>
            </div>
            <div className="modal-body p-4">
              <form>
                <div className="row">
                  <div className="col-12">
                    <div className="mb-4">
                      <label className="form-label fw-bold">
                        Your Price <span className="text-danger">*</span>
                      </label>
                      <input
                        name="name"
                        id="name"
                        type="text"
                        className="form-control"
                        defaultValue="1.5ETH"
                      />
                    </div>
                  </div>
                  {/*end col*/}
                </div>
              </form>

              <div className="py-3 border-top">
                <div className="d-flex justify-content-between">
                  <p className="fw-bold small"> You must bid at least:</p>
                  <p className="text-primary"> 1.22 ETH </p>
                </div>
                <div className="d-flex justify-content-between">
                  <p className="fw-bold small"> Service free:</p>
                  <p className="text-primary"> 0.05 ETH </p>
                </div>
                <div className="d-flex justify-content-between">
                  <p className="fw-bold small"> Total bid amount:</p>
                  <p className="text-primary mb-0"> 1.27 ETH </p>
                </div>
              </div>

              <div className="bg-soft-danger p-3 rounded shadow">
                <div className="d-flex align-items-center">
                  <i className="uil uil-exclamation-circle h2 mb-0 me-2"></i>
                  <div className="flex-1">
                    <h6 className="mb-0">This creator is not verified</h6>
                    <small className="mb-0">
                      Purchase this item at your own risk
                    </small>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  className="btn btn-pills btn-primary w-100"
                  data-bs-target="#buyNftSuccess"
                  data-bs-toggle="modal"
                >
                  <i className="mdi mdi-cart fs-5 me-2"></i> Continue
                </button>
                <form>
                  <div className="form-check align-items-center d-flex mt-2">
                    <input
                      className="form-check-input mt-0"
                      type="checkbox"
                      id="AcceptT&C"
                    />
                    <label
                      className="form-check-label text-muted ms-2"
                      htmlFor="AcceptT&C"
                    >
                      I Accept{' '}
                      <a
                        href=""
                        onClick={e => e.preventDefault()}
                        className="text-primary"
                      >
                        Terms And Condition
                      </a>
                    </label>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="buyNftSuccess"
        aria-hidden="true"
        aria-labelledby="exampleModalToggleLabel2"
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content border-0 shadow-md rounded-md">
            <div className="position-absolute top-0 start-100 translate-middle z-index-1">
              <button
                type="button"
                className="btn btn-icon btn-pills btn-sm btn-light btn-close opacity-10"
                data-bs-dismiss="modal"
                id="close-modal"
              >
                <i className="uil uil-times fs-4"></i>
              </button>
            </div>
            <div className="modal-body text-center p-4">
              <h3>Yahhhoooo! 🎉</h3>
              <h6 className="text-muted mb-0">
                You successfully purchased{' '}
                <a href="" className="text-reset">
                  <u>XYZ nft</u>
                </a>{' '}
                from Chain Master Finance
              </h6>

              <ul className="rounded-md shadow p-4 border list-unstyled mt-4">
                <li className="d-flex justify-content-between">
                  <span className="fw-bold me-5">Status:</span>
                  <span className="text-warning">Processing</span>
                </li>

                <li className="d-flex justify-content-between mt-2">
                  <span className="fw-bold me-5">Transaction ID:</span>
                  <span className="text-muted">qhut0...hfteh45</span>
                </li>
              </ul>

              <ul className="list-unstyled social-icon mb-0 mt-4">
                {[
                  'uil uil-facebook-f',
                  'uil uil-instagram',
                  'uil uil-linkedin',
                  'uil uil-dribbble',
                  'uil uil-twitter',
                ]?.map((data, index) => {
                  return (
                    <li className="list-inline-item lh-1 mr-1" key={index}>
                      <a href="" className="rounded">
                        <i className={data}></i>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Buy Now NFt Modal */}
    </Main>
  )
}

export default ItemDetailOne
