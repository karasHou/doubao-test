import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from "typeorm";
import { Document } from "./document.entity";
import { User } from "../../user/entities/user.entity";

@Entity()
export class DocumentVersion {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() =&gt; Document, (document) =&gt; document.versions)
  document: Document;

  @Column()
  version_number: number;

  @Column({ type: "blob" })
  content: Buffer;

  @Column({ nullable: true })
  change_log: string;

  @ManyToOne(() =&gt; User, (user) =&gt; user.id)
  created_by: User;

  @CreateDateColumn()
  created_at: Date;
}