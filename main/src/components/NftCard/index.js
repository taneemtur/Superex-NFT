import React from 'react'
import { client08 } from '../imageImport'
import { getChainByName } from '../../blockchain/supportedChains'
import { useNavigate } from 'react-router-dom'

const NftCard = ({nft, index}) => {
    const navigate = useNavigate();
  return (
    <div key={index} className='mt-5'>
    <div className="card nft-items nft-primary rounded-md shadow overflow-hidden mb-1 p-3">
      <div className="d-flex justify-content-between">
        <div className="img-group">
          <a
            href="/creator-profile"
            onClick={e => {
              e.preventDefault()
              navigate('/creator-profile')
            }}
            className="user-avatar"
          >
            <img
              src={nft?.owner?.profileImage || client08}
              alt="user"
              className="avatar avatar-sm-sm img-thumbnail border-0 shadow-sm rounded-circle"
            />
          </a>
        </div>

        <span className="like-icon shadow-sm">
          <a
            href=""
            onClick={e => e.preventDefault()}
            className="text-muted icon"
          >
            <i className="mdi mdi-18px mdi-heart mb-0"></i>
          </a>
        </span>
      </div>

      <div className="nft-image rounded-md mt-3 position-relative overflow-hidden">
        <a
          href={`/nft/${nft?.nftAddress}`}
          onClick={e => {
            e.preventDefault()
            navigate(`/nft/${nft?.nftAddress}`)
          }}
        >
          <img
            src={nft?.image || client08}
            className="img-fluid"
            alt={nft?.name}
            style={{ width: '100%', height: '250px', objectFit: 'cover', }}
          />
        </a>
        {nft?.collection?.category && (
          <div className="position-absolute top-0 start-0 m-2">
            <a
              href=""
              onClick={e => e.preventDefault()}
              className="badge badge-link bg-primary"
            >
              {nft?.collection?.category?.name}
            </a>
          </div>
        )}
        <div
          className={`${nft?.id ? '' : 'hide-data'
            } position-absolute bottom-0 start-0 m-2 bg-gradient-primary text-white title-dark rounded-pill px-3`}
        >
          <i className="uil uil-clock"></i>{' '}
        </div>
      </div>

      <div className="card-body content position-relative p-0 mt-3">
        <a
          href={`/nft/${nft?.nftAddress}`}
          onClick={e => {
            e.preventDefault()
            navigate(`/nft/${nft?.nftAddress}`)
          }}
          className="title text-dark h6"
        >
          {nft?.name}
        </a>

        <div className="d-flex justify-content-between mt-2">
          <small className="rate fw-bold">{nft?.price} {getChainByName(nft?.blockchain)} </small>
        </div>
      </div>
    </div>
  </div>
  )
}

export default NftCard