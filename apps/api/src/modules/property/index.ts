/**
 * @file index.ts
 * @module property
 * @description Re-exports for property module.
 * @author BharatERP
 * @created 2025-03-10
 */

export { PropertyModule } from './property.module';
export { PropertyService } from './services/property.service';
export { PropertyResolver } from './resolvers/property.resolver';
export { Property } from './entities/property.entity';
export { CreatePropertyDto } from './dtos/create-property.dto';
export { UpdatePropertyDto } from './dtos/update-property.dto';
export { PropertyFilterDto } from './dtos/property-filter.dto';
