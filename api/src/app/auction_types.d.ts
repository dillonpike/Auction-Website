type AuctionJSON = {

    id: number,

    title: string,

    description: string,

    end_date: string,

    image_filename: string,

    reserve: number,

    seller_id: number,

    category_id: number
}

type Bid = {

    id: number,

    auctionId: number,

    bidderId: number,

    amount: number,

    timestamp: number
}

type Auction = {

    auctionId: number,

    title: string,

    categoryId: number,

    sellerId: number,

    sellerFirstName: string,

    sellerLastName: string,

    reserve: number,

    numBids: number,

    highestBid: number,

    description: string,

    endDate: string,

    imageFilename: string,
}