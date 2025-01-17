import React, { useEffect } from 'react'
import DatePicker from "react-datepicker";
import axiosConfig from '../../axiosConfig';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { type } from 'os';
import { approveCollection, listNFT, listAuctionNFT } from '../../blockchain/mintContracts';
import { useSelector } from 'react-redux';
import { NFT_ACTIVITIES, USER_ACTIVITIES } from '../../activities';

const LISTINGTYPE = {
    auction: 'auction',
    fixedprice: 'fixedprice'
}

const NFTListModel = ({ id, labelledby, nftAddress, setNft, prevPrice, nft }) => {
    const navigate = useNavigate()
    const { account } = useSelector(state => state.theme);
    const [listingType, setListingType] = React.useState(LISTINGTYPE.fixedprice)
    const [startDate, setStartDate] = React.useState(new Date());
    const [endDate, setEndDate] = React.useState(new Date());
    const [price, setPrice] = React.useState(nft?.price)
    const btnRef = React.useRef(null)

    const getNftData = async () => {
        await axiosConfig.get(`/nfts/nft/${nftAddress}`).then((res) => {
            setNft(res.data.data)
            console.log(nftAddress)
        })
    }

    const handleListNFT = async (paymentToken = 'Eth') => {
        const id = toast.loading('Listing NFT')
        try {
            await approveCollection(account, nft.blockchain, nft?.collection?.collectionAddress)
            const fixedListingId = await listNFT(paymentToken, parseInt(nft?.tokenId), 1, nft?.price, nft?.collection?.collectionAddress, nft?.blockchain, account);
            await axiosConfig.put("/nfts/listnft", {
                listingType,
                endDate: listingType == LISTINGTYPE.fixedprice ? null : endDate,
                startDate: listingType == LISTINGTYPE.fixedprice ? null : startDate,
                nftAddress,
                price,
                fixedListingId,
                paymentToken
            }).then(async (res) => {
                await axiosConfig.post("/activity/useractivity", {
                    // userId, activityName, activityData
                    userId: account,
                    activityName: USER_ACTIVITIES.LIST_NFT,
                    activityData: {
                        ...res.data.data,
                        listedAt: new Date()
                    }
                })
                await axiosConfig.post("/activity/nftactivity", {
                    nftId: res.data.data.nftAddress,
                    activityData: {
                      activity: NFT_ACTIVITIES.LIST_NFT,
                      listedAt: new Date(),
                      ...res.data.data
                    }
                  })
                toast.update(id, {
                    render: `${res.data.message}`, closeOnClick: true, isLoading: false, autoClose: 5000, closeButton: true, type: 'success'
                })
                setNft(prev => ({
                    ...prev,
                    listed: true,
                    type: listingType,
                    endDate: listingType == LISTINGTYPE.fixedprice ? null : res.data.data.auctionTimeEnd
                }))
                getNftData()
            }).catch(error => {
                toast.update(id, {
                    render: `${error.message}`, closeOnClick: true, isLoading: false, autoClose: 5000, closeButton: true
                })
            })
        } catch (error) {
            toast.update(id, {
                render: `${error.message}`, closeOnClick: true, isLoading: false, autoClose: 5000, closeButton: true
            })
        }
    }

    const handleAuctionListing = async (paymentToken = 'Eth') => {
        const id = toast.loading('Listing NFT')
        try {
            await approveCollection(account, nft.blockchain, nft?.collection?.collectionAddress)
            const auctionListingId = await listAuctionNFT(nft?.price, Math.floor((startDate.getTime() / 1000)), Math.floor((endDate.getTime() / 1000)), parseInt(nft?.tokenId), 1, nft?.collection?.collectionAddress, paymentToken, nft?.blockchain, account);
            await axiosConfig.put("/nfts/listnft", {
                listingType,
                startDate: listingType == LISTINGTYPE.fixedprice ? null : Math.floor((startDate.getTime() / 1000)),
                endDate: listingType == LISTINGTYPE.fixedprice ? null : Math.floor((endDate.getTime() / 1000)),
                nftAddress,
                price,
                auctionListingId,
                paymentToken
            }).then(async (res) => {
                await axiosConfig.post("/nfts/bidnft", {
                    nftAddress,
                    blockchain: nft?.blockchain,
                    price,
                    user: account,
                    owner: account,
                    auctionTimeStart: Math.floor((startDate.getTime() / 1000)),
                    auctionTimeEnd: Math.floor((endDate.getTime() / 1000)),
                    userBidTime: new Date(),
                    auctionListingId,
                    paymentToken
                  })
                await axiosConfig.post("/activity/useractivity", {
                    // userId, activityName, activityData
                    userId: account,
                    activityName: USER_ACTIVITIES.LIST_NFT,
                    activityData: {
                        ...res.data.data,
                        listedAt: new Date()
                    }
                })
                await axiosConfig.post("/activity/nftactivity", {
                    nftId: res.data.data.nftAddress,
                    activityData: {
                      activity: NFT_ACTIVITIES.LIST_NFT,
                      listedAt: new Date(),
                      ...res.data.data
                    }
                  })
                toast.update(id, {
                    render: `${res.data.message}`, closeOnClick: true, isLoading: false, autoClose: 5000, closeButton: true, type: 'success'
                })
                setNft(prev => ({
                    ...prev,
                    listed: true,
                    type: listingType,
                    endDate: listingType == LISTINGTYPE.fixedprice ? null : res.data.data.auctionTimeEnd
                }))
                getNftData()
            }).catch(error => {
                toast.update(id, {
                    render: `${error.message}`, closeOnClick: true, isLoading: false, autoClose: 5000, closeButton: true
                })
            })
        } catch (error) {
            toast.update(id, {
                render: `${error.message}`, closeOnClick: true, isLoading: false, autoClose: 5000, closeButton: true
            })
        }
    }


    useEffect(() => {
        nft && setPrice(nft?.price)
    }, [nft])

    return (
        <div
            className="modal fade"
            id={id}
            aria-labelledby={labelledby}
            tabIndex="-1"
        >
            <div className="modal-dialog modal-dialog-centered modal-sm">
                <div className="modal-content border-0 shadow-md rounded-md">
                    <div className="modal-header">
                        <h5 className="modal-title" id={labelledby}>
                            List NFT
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
                                <div className="col-12 mb-4">
                                    <label className="form-label fw-bold">Listing Type:</label>
                                    <select
                                        required
                                        value={listingType} className='form-control' onChange={e => setListingType(e.target.value)} >
                                        <option value={LISTINGTYPE.fixedprice}> {LISTINGTYPE.fixedprice} </option>
                                        <option value={LISTINGTYPE.auction}> {LISTINGTYPE.auction} </option>
                                    </select>
                                </div>
                                {
                                    listingType === LISTINGTYPE.auction && (
                                    <>
                                        <div className="col-12 mb-4">
                                            <label className="form-label fw-bold">Auction Start Time:</label>
                                            <DatePicker
                                                selected={startDate}
                                                onChange={(date) => {
                                                    console.log(date)
                                                    setStartDate(date)
                                                }}
                                                className='form-control'
                                                showTimeSelect
                                                dateFormat="Pp"
                                            />
                                        </div>
                                        <div className="col-12 mb-4">
                                            <label className="form-label fw-bold">Auction End Time:</label>
                                            <DatePicker
                                                selected={endDate}
                                                onChange={(date) => {
                                                    console.log(date)
                                                    setEndDate(date)
                                                }}
                                                className='form-control'
                                                showTimeSelect
                                                dateFormat="Pp"
                                            />
                                        </div>
                                    </>
                                    )
                                }
                                <div className="col-12 mb-4">
                                    <label className="form-label fw-bold">Price</label>
                                    <input className='form-control' type="text" value={price} onChange={e => setPrice(e.target.value)} />
                                </div>
                            </div>
                        </form>

                        <div className="mt-4">
                            <button
                                className="btn btn-pills btn-primary w-100"
                                data-bs-dismiss="modal"
                                id="close-modal"
                                onClick={() => {
                                    listingType == 'fixedprice' ? handleListNFT('Eth') : handleAuctionListing('Eth')
                                }}
                                ref={btnRef}
                            >
                                List NFT with Native Token
                            </button>
                        </div>
                        <div className='mt-4'>
                            <button
                                className="btn btn-pills btn-primary w-100"
                                data-bs-dismiss="modal"
                                id="close-modal"
                                onClick={() => {
                                    listingType == 'fixedprice' ? handleListNFT('USDT') : handleAuctionListing('USDT')
                                }}
                                ref={btnRef}
                            >
                                List NFT with USDT
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NFTListModel