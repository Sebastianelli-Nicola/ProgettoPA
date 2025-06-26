import { Model, DataTypes, Optional } from 'sequelize';
import { getSequelizeInstance } from '../DB/sequelize';  

interface AuctionAttributes {
    id: number;
    title: string;
    minParticipants: number;
    maxParticipants: number;
    entryFee: number; //quota di iscrizione
    maxPrice: number; //prezzo massimo dell'asta
    minIncrement: number; //incremento minimo dell'asta
    bidsPerParticipant: number; //numero di puntate disponibili per partecipante
    status: 'created' | 'open' | 'bidding' | 'closed';
    startTime: Date;
    endTime: Date;
    relaunchTime: number; //durata della fase rilancio in minuti
}

interface AuctionCreationAttributes extends Optional<AuctionAttributes, 'id' | 'status'> {}

class Auction extends Model<AuctionAttributes, AuctionCreationAttributes> implements AuctionAttributes {
    public id!: number;
    public title!: string;
    public minParticipants!: number;
    public maxParticipants!: number;
    public entryFee!: number;
    public maxPrice!: number;
    public minIncrement!: number;
    public bidsPerParticipant!: number;
    public status!: 'created' | 'open' | 'bidding' | 'closed';
    public startTime!: Date;
    public endTime!: Date;
    public relaunchTime!: number;

    // timestamps!
    //public readonly createdAt!: Date;
    //public readonly updatedAt!: Date;
}

//istanza singleton di sequelize
const sequelize = getSequelizeInstance();

Auction.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  minParticipants: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  maxParticipants: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  entryFee: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  maxPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  minIncrement: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  bidsPerParticipant: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  status: { type: DataTypes.ENUM('created', 'open', 'bidding', 'closed'), defaultValue: 'created' },
  startTime: { type: DataTypes.DATE, allowNull: false },
  endTime: { type: DataTypes.DATE, allowNull: false },
  relaunchTime: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
}, {
  sequelize,
  tableName: 'auctions',
  modelName: 'Auction',
});

export default Auction;