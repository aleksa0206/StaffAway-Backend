import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as userRepository from '../repositories/userRepository'

export async function login(email: string , password: string) { 
    const user = await userRepository.findUserByEmail(email);

    if(!user) { 
        throw new Error("Neispravan email ili lozinka")
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash)

    if(!passwordMatches) { 
        throw new Error("Neispravan email ili lozinka")
    }

    const token = jwt.sign({ 
        userId: user.id, role: user.role, companyId: user.companyId
    }, process.env.JWT_SECRET as string ,  { 

        expiresIn: "15m"
    })

    return {token, user}
} 
