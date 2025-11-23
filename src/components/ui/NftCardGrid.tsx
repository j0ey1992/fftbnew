'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from '@/styles/components/Card.module.css'

interface NftItem {
  id: string
  name: string
  image: string
  staked?: boolean
  rewards?: string
  collection?: string
}

interface NftCardGridProps {
  items: NftItem[]
  title?: string
  seeAllLink?: string
  className?: string
}

export function NftCardGrid({
  items,
  title = 'NFT Collections',
  seeAllLink,
  className = ''
}: NftCardGridProps) {
  return (
    <div className={className}>
      {/* Section Header */}
      {(title || seeAllLink) && (
        <div className={styles.sectionHeader}>
          {title && <h2 className={styles.sectionTitle}>{title}</h2>}
          {seeAllLink && (
            <Link href={seeAllLink} className={styles.seeAllLink}>
              See All
            </Link>
          )}
        </div>
      )}
      
      {/* NFT Grid */}
      <div className={styles.nftGrid}>
        {items.map((nft) => (
          <Link key={nft.id} href={`/nft/${nft.id}`}>
            <div className={styles.nftCard}>
              <div className={styles.nftImageContainer}>
                <Image
                  src={nft.image}
                  alt={nft.name}
                  fill
                  className={styles.nftImage}
                />
                
                {nft.staked && (
                  <div className={styles.badge}>
                    Staked
                  </div>
                )}
              </div>
              
              <div className={styles.nftInfo}>
                <h3 className={styles.nftName}>{nft.name}</h3>
                
                <div className={styles.nftMeta}>
                  {nft.collection && (
                    <span>{nft.collection}</span>
                  )}
                  
                  {nft.rewards && (
                    <span className="text-green-500">
                      {nft.rewards}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
