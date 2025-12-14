import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { DocumentVersion } from "./document-version.entity";

@Entity()
export class Document {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: "blob", nullable: true })
  content: Buffer | null;

  @ManyToOne(() =&gt; User, (user) =&gt; user.id)
  created_by: User;

  @Column({ default: false })
  is_deleted: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() =&gt; DocumentVersion, (version) =&gt; version.document)
  versions: DocumentVersion[];
}